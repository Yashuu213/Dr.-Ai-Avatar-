import re

class PIIRedactor:
    """
    A simple Regex-based PII Redactor.
    In a full production hospital setting, consider using Microsoft Presidio 
    or a dedicated medical NLP library for higher accuracy.
    """
    def __init__(self):
        self.patterns = {
            'EMAIL': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b',
            'PHONE': r'\b(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\b',
            'SSN': r'\b\d{3}[-]?\d{2}[-]?\d{4}\b',
            # Simple heuristic for names: Mr./Mrs./Dr. followed by capitalized words
            'NAME_PREFIX': r'\b(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b'
        }

    def redact(self, text: str) -> str:
        if not text:
            return text
            
        redacted_text = text
        for pii_type, pattern in self.patterns.items():
            redacted_text = re.sub(pattern, f"[REDACTED_{pii_type}]", redacted_text)
            
        return redacted_text
    
    def redact_name(self, name: str) -> str:
        """Specific method to redact a name field, returning a pseudonymized version."""
        if not name or name.lower() == 'unknown':
            return name
        return "[REDACTED_PATIENT_NAME]"
        
    def redact_id(self, patient_id: str) -> str:
        if not patient_id or patient_id.lower() == 'unknown':
            return patient_id
        return "[REDACTED_PATIENT_ID]"

