import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  applyApplicationFilters,
  filtersFromUrlSearchParams,
} from "@/lib/application-filters";
import { buildApplicationsCsv, type CsvApplication } from "@/lib/applications-csv";

const CSV_COLUMNS = "platform, title, listing_url, genre_major, genre_minor, listed_amount_min, listed_amount_max, actual_amount, applicant_count, client_rating, client_completion_rate, deadline, status, proposal_text, memo, created_at, updated_at";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("認証が必要です。", { status: 401 });

  const filters = filtersFromUrlSearchParams(new URL(request.url).searchParams);
  const query = supabase.from("applications").select(CSV_COLUMNS).order("created_at", { ascending: false });
  const { data, error } = await applyApplicationFilters(query, filters);
  if (error) return new NextResponse("CSVを作成できませんでした。", { status: 500 });

  const csv = buildApplicationsCsv((data ?? []) as CsvApplication[]);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const filename = encodeURIComponent(`案件応募_${date}.csv`);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, no-store",
    },
  });
}
