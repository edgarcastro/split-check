# functions/main.py
import json
import os
from firebase_functions import https_fn, options
from firebase_admin import initialize_app
import boto3
from botocore.exceptions import ClientError

initialize_app()

# CORS configuration for the frontend
cors_options = options.CorsOptions(
    cors_origins=["*"],
    cors_methods=["POST", "OPTIONS"],
)


def get_textract_client():
    """Create and return a Textract client with credentials from environment."""
    return boto3.client(
        "textract",
        region_name=os.environ.get("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
    )


def extract_line_items(expense_documents: list) -> list:
    """
    Extract line items from Textract AnalyzeExpense response.
    Returns a list of items with name, price, and quantity.
    """
    items = []

    for doc in expense_documents:
        line_item_groups = doc.get("LineItemGroups", [])

        for group in line_item_groups:
            line_items = group.get("LineItems", [])

            for line_item in line_items:
                item_data = {
                    "name": None,
                    "price": None,
                    "quantity": None,
                    "unit_price": None,
                }

                expense_fields = line_item.get("LineItemExpenseFields", [])

                for field in expense_fields:
                    field_type = field.get("Type", {}).get("Text", "")
                    value = field.get("ValueDetection", {}).get("Text", "")

                    if field_type == "ITEM":
                        item_data["name"] = value
                    elif field_type == "PRICE":
                        item_data["price"] = parse_price(value)
                    elif field_type == "QUANTITY":
                        item_data["quantity"] = parse_quantity(value)
                    elif field_type == "UNIT_PRICE":
                        item_data["unit_price"] = parse_price(value)

                # Only add if we have at least a name or price
                if item_data["name"] or item_data["price"]:
                    # Default quantity to 1 if not specified
                    if item_data["quantity"] is None:
                        item_data["quantity"] = 1

                    # If no price but unit_price exists, use that
                    if item_data["price"] is None and item_data["unit_price"]:
                        item_data["price"] = item_data["unit_price"]

                    # Remove unit_price from final output
                    del item_data["unit_price"]

                    items.append(item_data)

    return items


def parse_price(value: str) -> float | None:
    """Parse price string to float."""
    if not value:
        return None
    try:
        # Remove currency symbols and whitespace
        cleaned = value.replace("$", "").replace("€", "").replace(",", "").strip()
        return float(cleaned)
    except (ValueError, AttributeError):
        return None


def parse_quantity(value: str) -> int | None:
    """Parse quantity string to int."""
    if not value:
        return None
    try:
        # Try to extract numeric value
        cleaned = value.strip()
        return int(float(cleaned))
    except (ValueError, AttributeError):
        return None


def extract_summary_fields(expense_documents: list) -> dict:
    """
    Extract summary fields like subtotal, tax, tip, total from the expense document.
    """
    summary = {
        "subtotal": None,
        "tax": None,
        "tip": None,
        "total": None,
        "service_charge": None,
    }

    for doc in expense_documents:
        summary_fields = doc.get("SummaryFields", [])

        for field in summary_fields:
            field_type = field.get("Type", {}).get("Text", "")
            value = field.get("ValueDetection", {}).get("Text", "")

            if field_type == "SUBTOTAL":
                summary["subtotal"] = parse_price(value)
            elif field_type == "TAX":
                summary["tax"] = parse_price(value)
            elif field_type == "TIP":
                summary["tip"] = parse_price(value)
            elif field_type == "TOTAL":
                summary["total"] = parse_price(value)
            elif field_type == "SERVICE_CHARGE":
                summary["service_charge"] = parse_price(value)

    return summary


# Supported file types for Textract AnalyzeExpense
SUPPORTED_MIME_TYPES = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "application/pdf": "PDF",
}

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB


def validate_file(file) -> tuple[bytes | None, str | None]:
    """
    Validate uploaded file type and size.
    Returns (file_bytes, error_message).
    """
    if not file:
        return None, "No file provided"

    # Check content type
    content_type = file.content_type
    if content_type not in SUPPORTED_MIME_TYPES:
        supported = ", ".join(SUPPORTED_MIME_TYPES.values())
        return None, f"Unsupported file type: {content_type}. Supported types: {supported}"

    # Read file bytes
    file_bytes = file.read()

    # Check file size
    if len(file_bytes) > MAX_FILE_SIZE:
        return None, f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB"

    # Check if file is empty
    if len(file_bytes) == 0:
        return None, "File is empty"

    return file_bytes, None


@https_fn.on_request(
    cors=cors_options,
    secrets=["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
)
def analyze_receipt(req: https_fn.Request) -> https_fn.Response:
    """
    Analyze a receipt image using AWS Textract AnalyzeExpense.

    Expects a POST request with multipart/form-data containing:
    - file: image file (JPEG, PNG) or PDF

    Returns JSON with:
    - items: list of {name, price, quantity}
    - summary: {subtotal, tax, tip, total, service_charge}
    """
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)

    if req.method != "POST":
        return https_fn.Response(
            json.dumps({"error": "Method not allowed"}),
            status=405,
            headers={"Content-Type": "application/json"},
        )

    try:
        # Get file from request
        if "file" not in req.files:
            return https_fn.Response(
                json.dumps({"error": "No file provided. Send file in 'file' field"}),
                status=400,
                headers={"Content-Type": "application/json"},
            )

        file = req.files["file"]

        # Validate file
        file_bytes, error = validate_file(file)
        if error:
            return https_fn.Response(
                json.dumps({"error": error}),
                status=400,
                headers={"Content-Type": "application/json"},
            )

        # Call Textract AnalyzeExpense
        textract = get_textract_client()
        response = textract.analyze_expense(Document={"Bytes": file_bytes})

        # Extract data from response
        expense_documents = response.get("ExpenseDocuments", [])
        items = extract_line_items(expense_documents)
        summary = extract_summary_fields(expense_documents)

        return https_fn.Response(
            json.dumps(
                {
                    "success": True,
                    "items": items,
                    "summary": summary,
                }
            ),
            status=200,
            headers={"Content-Type": "application/json"},
        )

    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "Unknown")
        error_message = e.response.get("Error", {}).get("Message", str(e))
        return https_fn.Response(
            json.dumps(
                {
                    "error": f"AWS Textract error: {error_code}",
                    "message": error_message,
                }
            ),
            status=500,
            headers={"Content-Type": "application/json"},
        )
    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": "Internal server error", "message": str(e)}),
            status=500,
            headers={"Content-Type": "application/json"},
        )
