import { NextRequest, NextResponse } from "next/server";
import { COACH_ID, supabaseClient, supabaseAdmin } from "@/lib/supabaseClient";
import { COACH_TIMEZONE, MAX_GROUP_SIZE } from "@/lib/time";
import { DateTime } from "luxon";

const jsonError = (error: string, status = 400) =>
    NextResponse.json({ error }, { status });

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { data, error } = await supabaseClient
        .from("booking")
        .select("*")
        .eq("id", params.id)
        .eq("coach_id", COACH_ID)
        .single();

    if (error || !data) {
        return jsonError("Booking not found", 404);
    }

    return NextResponse.json({
        ...data,
        start_time: DateTime.fromISO(data.start_time).setZone(COACH_TIMEZONE).toISO({ suppressMilliseconds: true }),
        end_time: DateTime.fromISO(data.end_time).setZone(COACH_TIMEZONE).toISO({ suppressMilliseconds: true }),
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Use supabaseAdmin if available to bypass RLS policies that might restrict deletion
    // If not available, fall back to public client (which likely will fail if RLS is tight)
    const supabase = supabaseAdmin || supabaseClient;

    const { error, count } = await supabase
        .from("booking")
        .delete({ count: "exact" })
        .eq("id", params.id)
        .eq("coach_id", COACH_ID);

    if (error) {
        console.error("DELETE /api/bookings/[id]", error);
        return jsonError("Unable to delete booking", 500);
    }

    if (count === 0) {
        // Log details to help debug why it wasn't found (ID mismatch? Coach ID mismatch?)
        console.warn(`DELETE failed: No row found for ID ${params.id} and CoachID ${COACH_ID}`);
        return jsonError("Booking not found or already deleted", 404);
    }

    return NextResponse.json({ success: true });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        // Validation for group size if provided
        if (body.group_size !== undefined && (body.group_size < 1 || body.group_size > MAX_GROUP_SIZE)) {
            return jsonError(`Group size must be between 1 and ${MAX_GROUP_SIZE}`, 400);
        }

        const { data, error } = await supabaseClient
            .from("booking")
            .update({
                student_name: body.student_name,
                student_type: body.student_type,
                group_size: body.group_size,
                contact_phone: body.contact_phone,
                contact_email: body.contact_email,
                status: body.status,
            })
            .eq("id", params.id)
            .eq("coach_id", COACH_ID)
            .select()
            .single();

        if (error) {
            console.error("PATCH /api/bookings/[id]", error);
            if (error.code === "23514") {
                return jsonError("Booking limit exceeded (Check group size constraint)", 400);
            }
            return jsonError("Unable to update booking", 500);
        }

        return NextResponse.json({
            ...data,
            start_time: DateTime.fromISO(data.start_time).setZone(COACH_TIMEZONE).toISO({ suppressMilliseconds: true }),
            end_time: DateTime.fromISO(data.end_time).setZone(COACH_TIMEZONE).toISO({ suppressMilliseconds: true }),
        });
    } catch (err) {
        console.error("PATCH /api/bookings/[id] parse error", err);
        return jsonError("Invalid request body", 400);
    }
}
