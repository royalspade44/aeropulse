from dataclasses import dataclass
from typing import Optional


@dataclass
class User:
    """Represents a user account row from the `users` table, returned as JSON to the mobile app."""

    id: str
    name_first: str
    name_last: str
    suffix: str
    alias: str
    email: str
    phone: str
    role: str
    status: str
    profile_photo: Optional[str]
    address: str
    municipality: str
    municipality_code: str
    submunicipality: str
    submunicipality_code: str
    thoroughfare: str
    property_block_lot: str
    apartment_unit: str
    landmark: str
    plus_code: str
    contact_method: str
    messenger_handle: str
    latitude: Optional[float]
    longitude: Optional[float]
    delivery_instructions: str
    customer_onboarded_at: Optional[str]
    technician_onboarded_at: Optional[str]
    created_at: str
    updated_at: str

    def to_dict(self) -> dict:
        """Serialize the User to a JSON-safe dict; includes the computed `name` field and omits sensitive credential fields."""
        name_parts = [self.name_first, self.name_last, self.suffix]
        return {
            'id': self.id,
            'name_first': self.name_first,
            'name_last': self.name_last,
            'suffix': self.suffix,
            'alias': self.alias,
            'name': ' '.join(part for part in name_parts if part).strip(),
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'status': self.status,
            'profile_photo': self.profile_photo,
            'address': self.address,
            'municipality': self.municipality,
            'municipality_code': self.municipality_code,
            'submunicipality': self.submunicipality,
            'submunicipality_code': self.submunicipality_code,
            'thoroughfare': self.thoroughfare,
            'property_block_lot': self.property_block_lot,
            'apartment_unit': self.apartment_unit,
            'landmark': self.landmark,
            'plus_code': self.plus_code,
            'contact_method': self.contact_method,
            'messenger_handle': self.messenger_handle,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'delivery_instructions': self.delivery_instructions,
            'customer_onboarded_at': self.customer_onboarded_at,
            'technician_onboarded_at': self.technician_onboarded_at,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }

    @staticmethod
    def from_row(row) -> 'User':
        """
        Construct a User instance from an aiosqlite.Row fetched from the `users` table.
        Called by route handlers and auth helpers after any SELECT query on the users table.
        """
        return User(
            id=row['id'],
            name_first=row['name_first'],
            name_last=row['name_last'],
            suffix=row['suffix'],
            alias=row['alias'],
            email=row['email'],
            phone=row['phone'],
            role=row['role'],
            status=row['status'],
            profile_photo=row['profile_photo'],
            address=row['address'],
            municipality=row['municipality'],
            municipality_code=row['municipality_code'],
            submunicipality=row['submunicipality'],
            submunicipality_code=row['submunicipality_code'],
            thoroughfare=row['thoroughfare'],
            property_block_lot=row['property_block_lot'],
            apartment_unit=row['apartment_unit'],
            landmark=row['landmark'],
            plus_code=row['plus_code'],
            contact_method=row['contact_method'],
            messenger_handle=row['messenger_handle'],
            latitude=row['latitude'],
            longitude=row['longitude'],
            delivery_instructions=row['delivery_instructions'],
            customer_onboarded_at=row['customer_onboarded_at'],
            technician_onboarded_at=row['technician_onboarded_at'],
            created_at=row['created_at'],
            updated_at=row['updated_at'],
        )


@dataclass
class AuditLog:
    """Represents a single audit log entry from the `audit_logs` table, capturing who did what and when."""

    id: str
    timestamp: str
    actor_id: Optional[str]
    actor_name: str
    actor_email: Optional[str]
    action: str
    target_id: Optional[str]
    details: str

    def to_dict(self) -> dict:
        """Serialize the AuditLog entry to a JSON-safe dict for inclusion in API responses."""
        return {
            'id': self.id,
            'timestamp': self.timestamp,
            'actor_id': self.actor_id,
            'actor_name': self.actor_name,
            'actor_email': self.actor_email,
            'action': self.action,
            'target_id': self.target_id,
            'details': self.details,
        }

    @staticmethod
    def from_row(row) -> 'AuditLog':
        """
        Construct an AuditLog instance from an aiosqlite.Row fetched from the `audit_logs` table.
        Called by list_audit_logs in routes/audit.py after querying the audit log table.
        """
        return AuditLog(
            id=row['id'],
            timestamp=row['timestamp'],
            actor_id=row['actor_id'],
            actor_name=row['actor_name'],
            actor_email=row['actor_email'],
            action=row['action'],
            target_id=row['target_id'],
            details=row['details'],
        )


@dataclass
class Session:
    """Represents an active user session row from the `sessions` table, linking a bearer token to a user ID and expiry."""

    token: str
    user_id: str
    created_at: str
    expires_at: str

    def to_dict(self) -> dict:
        """Serialize the Session to a JSON-safe dict, primarily for debugging and internal inspection."""
        return {
            'token': self.token,
            'user_id': self.user_id,
            'created_at': self.created_at,
            'expires_at': self.expires_at,
        }

    @staticmethod
    def from_row(row) -> 'Session':
        """
        Construct a Session instance from an aiosqlite.Row fetched from the `sessions` table.
        Used by session-management helpers in auth.py to hydrate session data from the database.
        """
        return Session(
            token=row['token'],
            user_id=row['user_id'],
            created_at=row['created_at'],
            expires_at=row['expires_at'],
        )


@dataclass
class OTP:
    """Represents a one-time password record from the `otps` table, used for the forgot-password / reset-password flow."""

    email: str
    code: str
    expires_at: str
    role: str

    def to_dict(self) -> dict:
        """Serialize the OTP record to a JSON-safe dict; used for testing and diagnostic responses."""
        return {
            'email': self.email,
            'code': self.code,
            'expires_at': self.expires_at,
            'role': self.role,
        }

    @staticmethod
    def from_row(row) -> 'OTP':
        """
        Construct an OTP instance from an aiosqlite.Row fetched from the `otps` table.
        Called by the verify-otp and reset-password routes after querying active OTP records.
        """
        return OTP(
            email=row['email'],
            code=row['code'],
            expires_at=row['expires_at'],
            role=row['role'],
        )
