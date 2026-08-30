-- Replace the free-form listed amount and add the two-level genre classification.
alter table public.applications
  drop column listed_amount_text,
  add column listed_amount_min numeric check (listed_amount_min >= 0),
  add column listed_amount_max numeric check (listed_amount_max >= 0),
  add column genre_major text,
  add column genre_minor text,
  add constraint applications_listed_amount_range_check check (
    listed_amount_max is null
    or (listed_amount_min is not null and listed_amount_max >= listed_amount_min)
  ),
  add constraint applications_genre_parent_check check (
    genre_major is not null or genre_minor is null
  );
