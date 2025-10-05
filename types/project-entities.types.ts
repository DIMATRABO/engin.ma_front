// project-entities.types.ts
// Generated from uploaded "Project Entities Summary" PDF. Source: uploaded file. :contentReference[oaicite:1]{index=1}

/**
 * Common ID type used across entities
 */
export type ID = string;

/** Enums (from PDF) */
export enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
}

export enum FieldsOfActivity {
    CONSTRUCTION = "CONSTRUCTION",
    TRANSPORT = "TRANSPORT",
    LIFTING = "LIFTING",
    ROADWORKS = "ROADWORKS",
    AGRICULTURE = "AGRICULTURE",
}

export enum UserRoleEnum {
    ADMIN = "ADMIN",
    CLIENT = "CLIENT",
    OWNER = "OWNER",
    PILOT = "PILOT",
}

export enum UserStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    DELETED = "DELETED",
}

/** Entities / Interfaces (shape based on columns in PDF) */

/** Bookings */
export interface Booking {
    id: ID;
    client_id?: ID; // FK -> users.id
    equipment_id?: ID; // FK -> equipment.id
    pilot_id?: ID; // FK -> users.id
    start_date?: string | Date;
    end_date?: string | Date;
    number_of_days: number;
    unit_price: number; // numeric(10,2)
    total_price: number; // numeric(12,2)
    status?: BookingStatus | string;
    created_at?: string | Date;
}

/** Categories */
export interface Category {
    id: ID;
    field_of_activity: FieldsOfActivity | string;
    name_en: string;
    name_ar: string;
    name_fr: string;
}

/** Cities */
export interface City {
    id: ID;
    name_en: string;
    name_ar: string;
    name_fr: string;
}

/** Equipment */
export interface Equipment {
    id: ID;
    owner_id?: ID | null; // FK -> users.id, ondelete=SET NULL
    pilot_id?: ID | null; // FK -> users.id, ondelete=SET NULL
    brand_id?: ID; // FK -> equipment_brands.id
    model_id?: ID; // FK -> equipment_models.id
    model_year?: number | null;
    construction_year?: number | null;
    date_of_customs_clearance?: number | null;
    city_id?: ID;
    title?: string | null; // NVARCHAR(255)
    description?: string | null; // text
    price_per_day?: number | null;
    is_available?: boolean;
    rating_average?: number;
    fields_of_activity?: string | FieldsOfActivity | (string | FieldsOfActivity)[]; // stored as text in PDF
    category_id?: ID;
    created_at?: string | Date;
}

/** Equipment images */
export interface EquipmentImage {
    id: ID;
    equipment_id: ID; // FK -> equipment.id, ondelete=CASCADE
    url: string; // String(500)
}

/** Equipment models */
export interface EquipmentModel {
    id: ID;
    name: string;
    brand_id?: ID;
    category_id?: ID;
}

/** Equipment brands */
export interface EquipmentBrand {
    id: ID;
    name: string;
}

/** Reviews */
export interface Review {
    id: ID;
    client_id?: ID;
    equipment_id?: ID;
    pilot_id?: ID;
    rating?: number; // integer
    comment?: string | null;
    created_at?: string | Date;
}

/** Users */
export interface User {
    id: ID;
    username?: string | null;
    password?: string | null;
    full_name?: string | null;
    email?: string | null;
    birthdate?: string | Date | null;
    address?: string | null;
    phone_number?: string | null;
    user_status?: UserStatus | string;
    email_verified_at?: string | null;
    reset_password_otp?: string | null;
    otp_expiration_date?: string | Date | null;
    created_at?: string | Date | null;
}

/** User roles (mapping table) */
export interface UserRole {
    user_id: ID; // PK, FK -> users.id
    role: UserRoleEnum | string; // PK
}
