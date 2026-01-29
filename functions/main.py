# functions/main.py
import base64
import os
from firebase_functions import https_fn
from firebase_admin import initialize_app
import boto3
from botocore.exceptions import ClientError

initialize_app()

# Check if running in emulator
IS_EMULATOR = os.environ.get("FUNCTIONS_EMULATOR") == "true"


# Error codes that frontend can interpret
class OCRErrorCode:
    BAD_DOCUMENT = "BAD_DOCUMENT"
    UNSUPPORTED_FORMAT = "UNSUPPORTED_FORMAT"
    DOCUMENT_TOO_LARGE = "DOCUMENT_TOO_LARGE"
    SERVICE_BUSY = "SERVICE_BUSY"
    RATE_LIMITED = "RATE_LIMITED"
    SERVICE_ERROR = "SERVICE_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    UNKNOWN_ERROR = "UNKNOWN_ERROR"


# Map AWS error codes to app error codes with retryable flag
AWS_ERROR_MAPPING = {
    "BadDocumentException": (OCRErrorCode.BAD_DOCUMENT, False),
    "UnsupportedDocumentException": (OCRErrorCode.UNSUPPORTED_FORMAT, False),
    "DocumentTooLargeException": (OCRErrorCode.DOCUMENT_TOO_LARGE, False),
    "ThrottlingException": (OCRErrorCode.SERVICE_BUSY, True),
    "ProvisionedThroughputExceededException": (OCRErrorCode.RATE_LIMITED, True),
    "InternalServerError": (OCRErrorCode.SERVICE_ERROR, True),
    "AccessDeniedException": (OCRErrorCode.INTERNAL_ERROR, False),
    "InvalidParameterException": (OCRErrorCode.INTERNAL_ERROR, False),
}


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
    """
    Parse price string to float, handling both US and European number formats.

    US format: 6,700.00 (comma = thousands, period = decimal)
    European format: 6.700,00 (period = thousands, comma = decimal)
    """
    if not value:
        return None
    try:
        # Remove currency symbols and whitespace
        cleaned = value.replace("$", "").replace("€", "").strip()

        # Find positions of last comma and last period
        last_comma = cleaned.rfind(",")
        last_period = cleaned.rfind(".")

        if last_comma > last_period:
            # European format: comma is decimal separator (e.g., "9.300,00")
            # Remove periods (thousands separator), replace comma with period
            cleaned = cleaned.replace(".", "").replace(",", ".")
        elif last_period > last_comma:
            # US format: period is decimal separator (e.g., "6,700.00")
            # Just remove commas (thousands separator)
            cleaned = cleaned.replace(",", "")
        else:
            # Only one or neither separator present
            # Check if comma looks like a decimal (e.g., "9,50" for €9.50)
            if last_comma != -1 and len(cleaned) - last_comma <= 3:
                cleaned = cleaned.replace(",", ".")
            else:
                # Remove commas as thousands separators
                cleaned = cleaned.replace(",", "")

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


def validate_file_data(file_data: str, content_type: str) -> tuple[bytes | None, str | None]:
    """
    Validate base64-encoded file data and content type.
    Returns (file_bytes, error_message).
    """
    if not file_data:
        return None, "No file data provided"

    if not content_type:
        return None, "No content type provided"

    # Check content type
    if content_type not in SUPPORTED_MIME_TYPES:
        supported = ", ".join(SUPPORTED_MIME_TYPES.values())
        return None, f"Unsupported file type: {content_type}. Supported types: {supported}"

    try:
        # Decode base64 data
        file_bytes = base64.b64decode(file_data)
    except Exception:
        return None, "Invalid base64 file data"

    # Check file size
    if len(file_bytes) > MAX_FILE_SIZE:
        return None, f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB"

    # Check if file is empty
    if len(file_bytes) == 0:
        return None, "File is empty"

    return file_bytes, None


@https_fn.on_call(
    secrets=["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
    enforce_app_check=not IS_EMULATOR,
)
def analyze_receipt(req: https_fn.CallableRequest) -> dict:
    """
    Analyze a receipt image using AWS Textract AnalyzeExpense.

    Expects callable request with data containing:
    - fileData: base64-encoded image file (JPEG, PNG) or PDF
    - contentType: MIME type of the file

    Returns dict with:
    - items: list of {name, price, quantity}
    - summary: {subtotal, tax, tip, total, service_charge}
    """
    try:
        data = req.data or {}
        file_data = data.get("fileData")
        content_type = data.get("contentType")

        # Validate file data
        file_bytes, error = validate_file_data(file_data, content_type)
        if error:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message=error,
            )

        # Call Textract AnalyzeExpense
        textract = get_textract_client()
        response = textract.analyze_expense(Document={"Bytes": file_bytes})

        # Extract data from response
        expense_documents = response.get("ExpenseDocuments", [])
        items = extract_line_items(expense_documents)
        summary = extract_summary_fields(expense_documents)

        return {
            "items": items,
            "summary": summary,
        }

    except https_fn.HttpsError:
        # Re-raise HttpsError as-is
        raise
    except ClientError as e:
        aws_error_code = e.response.get("Error", {}).get("Code", "Unknown")
        aws_error_message = e.response.get("Error", {}).get("Message", str(e))

        # Map AWS error to app error code
        error_info = AWS_ERROR_MAPPING.get(
            aws_error_code, (OCRErrorCode.UNKNOWN_ERROR, False)
        )
        app_error_code, retryable = error_info

        # Use UNAVAILABLE for retryable errors, INTERNAL for non-retryable
        functions_error_code = (
            https_fn.FunctionsErrorCode.UNAVAILABLE
            if retryable
            else https_fn.FunctionsErrorCode.INTERNAL
        )

        raise https_fn.HttpsError(
            code=functions_error_code,
            message=f"Receipt processing failed: {aws_error_message}",
            details={"errorCode": app_error_code, "retryable": retryable},
        )
    except Exception:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message="Internal server error",
            details={"errorCode": OCRErrorCode.INTERNAL_ERROR, "retryable": False},
        )
