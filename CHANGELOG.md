# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com). Versioning: [Semver](https://semver.org).

## [Unreleased]

### Fixed (code-review follow-ups)

- `business_data_google_locations`, `merchant_google_locations`, `merchant_amazon_locations`: restored backward-compatible `country` alias. Callers that still send `country` (when it looks like an ISO code) keep working; the ISO code is normalized to lowercase for the path segment. Mirrors the existing `serp_google_locations` behavior.
- `keywords_google_ads_keywords_for_keyword` (max 20), `keywords_bing_keywords_for_keywords` (max 200), `keywords_google_trends_explore` (max 5): the documented array-length limits are now enforced in the handlers, not just declared in the Zod schema. This guards inputs that reach handlers without Zod parsing (e.g. via the HTTP bridge) and returns a friendly error instead of making an invalid API request.

### Changed

- `CONTRIBUTING.md`: clarified the `z.coerce.number()` guidance — coercion benefits schema introspection and validation layers; handlers invoked directly via the HTTP bridge do not run Zod parsing, so hard constraints must be enforced in the handler.
- `README.md`: the version note now references `1.1.0` and the changelog instead of a feature-branch name.

## [1.1.0] - 2026-04-21

### Fixed

#### SERP
- `serp_google_organic_live`: path fixed (was `/serp/google/organic/live`, now `/serp/google/organic/live/advanced`)
- `serp_google_images_live`: path fixed (was `/serp/google/images/live`, now `/serp/google/images/live/advanced`)
- `serp_google_news_live`: path fixed (was `/serp/google/news/live`, now `/serp/google/news/live/advanced`)
- `serp_bing_organic_live`: path fixed (was `/serp/bing/organic/live`, now `/serp/bing/organic/live/advanced`)
- `serp_yahoo_organic_live`: path fixed (was `/serp/yahoo/organic/live`, now `/serp/yahoo/organic/live/advanced`)
- `serp_youtube_organic_live`: path fixed (was `/serp/youtube/organic/live`, now `/serp/youtube/organic/live/advanced`)
- `serp_google_organic_task_get`: path fixed (was `/serp/google/organic/task_get/${id}`, now `/serp/google/organic/task_get/advanced/${id}`)
- `serp_google_locations`: changed from `?country=<name>` query param to ISO code path segment `/serp/google/locations/<iso_code>`; schema field renamed from `country` to `country_iso_code`
- Schema coercion: `googleOrganicLiveSchema.location_code`, `googleOrganicLiveSchema.depth`, `googleOrganicTaskSchema.priority`, `serp_google_maps_live` inline `location_code` all changed from `z.number()` to `z.coerce.number()`

#### App Data
- `app_data_google_play_locations`: path changed from `/app_data/google_play/locations` to `/app_data/google/locations/<iso>` path segment
- `app_data_google_play_languages`: path changed from `/app_data/google_play/languages` to `/app_data/google/languages`
- Schema coercion: all numeric input fields (`location_code`, `limit`, `offset`, `depth`, `priority`) changed to `z.coerce.number()` across all new and updated tools

#### Business Data
- `business_data_google_hotels_search`: path changed from `/business_data/google/hotels/search/live` to `/business_data/google/hotel_searches/live`
- `business_data_google_hotels_info`: path changed from `/business_data/google/hotels/info/live` to `/business_data/google/hotel_info/live/advanced`; field `hotel_id` renamed to `hotel_identifier`
- `business_data_google_locations`: changed from `?country=<name>` query param to ISO code path segment `/business_data/google/locations/<iso>`; schema field renamed `country` to `country_iso_code`
- `business_data_business_listings_locations`: country query param removed; bare GET `/business_data/business_listings/locations`
- `business_data_business_listings_categories`: country query param removed; bare GET `/business_data/business_listings/categories`
- Schema coercion: all MCP-exposed numeric fields changed from `z.number()` to `z.coerce.number()`

#### Merchant
- `merchant_google_locations`: changed from `?country=<name>` query param to ISO code path segment `/merchant/google/locations/<iso>`; schema field renamed `country` to `country_iso_code`
- `merchant_amazon_locations`: changed from `?country=<name>` query param to `/merchant/amazon/locations/<iso>` path segment; schema field renamed `country` to `country_iso_code`
- Schema coercion: all numeric fields on task schemas changed to `z.coerce.number()`

#### Backlinks
- `backlinks_errors`: method changed from GET to POST (`/backlinks/errors`); new schema fields: `limit`, `offset`, `filtered_function`, `datetime_from`, `datetime_to`
- `backlinks_id_list`: method changed from GET to POST (`/backlinks/id_list`); required fields `datetime_from` and `datetime_to` added; schema fields: `limit`, `offset`, `sort`, `include_metadata`
- Schema coercion: `limit`, `offset`, `internal_list_limit` changed from `z.number()` to `z.coerce.number()` across all 10 affected tools

#### Domain Analytics
- `domain_analytics_technologies_summary`: path segment corrected from `summary` to `technologies_summary` (correct path: `/domain_analytics/technologies/technologies_summary/live`)
- `domain_analytics_technologies_technologies`: method changed from POST to GET; `/live` suffix removed (correct path: GET `/domain_analytics/technologies/technologies`)
- Schema coercion: `limit`, `offset` changed to `z.coerce.number()` for `domains_by_technology`, `domain_technologies`, `technology_stats`, `domains_by_html_terms`

#### OnPage
- `onpage_pages`: `id` moved from URL path template to POST body; path changed from `/on_page/pages/${id}` to static `/on_page/pages`
- `onpage_resources`: `id` moved from URL path template to POST body; path changed from `/on_page/resources/${id}` to static `/on_page/resources`
- `onpage_duplicate_content`: `id` moved from URL path template to POST body; path changed from `/on_page/duplicate_content/${id}` to static `/on_page/duplicate_content`
- Schema coercion: `max_crawl_pages`, `limit`, `offset` changed to `z.coerce.number()` across affected tools

#### Keywords Data
- `keywords_google_ads_keywords_for_keyword`: dual-accept schema for `keyword` (string, backward-compat) and `keywords` (array, docs-correct); outgoing payload always sends `keywords` array. Was sending unrecognized `keyword` string field that the API ignored.
- `keywords_bing_keywords_for_keywords`: same dual-accept pattern — Bing expects `keywords` array (up to 200), wrapper was sending `keyword` string.
- `keywords_google_trends_explore`: added `.max(5)` guard on `keywords` array per docs.
- Schema coercion: `location_code`, `category_code` changed from `z.number()` to `z.coerce.number()`.

#### DataForSEO Labs
- `labs_google_play_keywords_for_app`: path segment `google_play` → `google` (correct path `/dataforseo_labs/google/keywords_for_app/live`)
- `labs_google_play_app_competitors`: path segment `google_play` → `google` (correct path `/dataforseo_labs/google/app_competitors/live`)
- `labs_app_store_keywords_for_app`: path segment `app_store` → `apple` (correct path `/dataforseo_labs/apple/keywords_for_app/live`)
- `labs_app_store_app_competitors`: path segment `app_store` → `apple` (correct path `/dataforseo_labs/apple/app_competitors/live`)
- `labs_categories`, `labs_locations`, `labs_languages`, `labs_available_history`: engine enum now accepts `apple`; `google_play` and `app_store` kept as deprecated aliases that are runtime-remapped to `google`/`apple` via a `normalizeEngine()` helper
- `labs_amazon_related_keywords`, `labs_amazon_ranked_keywords`, `labs_amazon_product_competitors`: `@deprecated` JSDoc added on undocumented `marketplace` field
- Schema coercion: `location_code`, `limit`, `offset`, `depth` changed from `z.number()` to `z.coerce.number()` across all Labs tools

#### Content Analysis
- `content_analysis_category`: path fixed from `/content_analysis/category/live` (non-existent) to `/content_analysis/category_trends/live`; primary param `url` → `keyword` with `url` kept as backward-compat alias (handler maps `url` → `keyword` in the outgoing payload)
- `content_analysis_summary`: dual-accept schema for `keyword` (docs-correct) and `url` (backward-compat alias mapped to keyword)
- `content_analysis_sentiment_analysis`: dual-accept schema for `keyword` (docs-correct) and `text` (backward-compat alias mapped to keyword)
- `content_analysis_rating_distribution`: added required `keyword` field (docs-required); `rating_values`/`algo` kept as optional with `@deprecated` JSDoc
- Schema coercion: `limit`, `offset` changed from `z.number()` to `z.coerce.number()` on `content_analysis_search`

#### Content Generation
- `content_generation_text`: path fixed from `/content_generation/text/live` to `/content_generation/generate_text/live` (per DataForSEO marketing page — docs pages 404 and raglite not indexed, so flagged as SUSPECT)
- `content_generation_meta_tags`: path fixed from `/content_generation/meta_tags/live` to `/content_generation/generate_meta_tags/live` (same SUSPECT flag)
- `content_generation_paraphrase`, `summarize`, `title`, `explain_code`: JSDoc comments added noting the path was not confirmable in docs and may return 404 in production

### Added

#### SERP
- `serp_google_jobs_task_post` — POST `/serp/google/jobs/task_post`
- `serp_google_jobs_task_ready` — GET `/serp/google/jobs/tasks_ready`
- `serp_google_jobs_task_get` — GET `/serp/google/jobs/task_get/advanced/${id}`
- `serp_baidu_organic_task_post` — POST `/serp/baidu/organic/task_post`
- `serp_baidu_organic_task_ready` — GET `/serp/baidu/organic/tasks_ready`
- `serp_baidu_organic_task_get` — GET `/serp/baidu/organic/task_get/advanced/${id}`

#### App Data
- `app_data_google_app_listings_search` — POST `/app_data/google/app_listings/search/live` (replaces broken `app_data_google_play_search`)
- `app_data_google_app_info_post` — POST `/app_data/google/app_info/task_post`
- `app_data_google_app_info_ready` — GET `/app_data/google/app_info/tasks_ready`
- `app_data_google_app_info_get` — GET `/app_data/google/app_info/task_get/advanced/${id}`
- `app_data_google_app_reviews_post` — POST `/app_data/google/app_reviews/task_post`
- `app_data_google_app_reviews_ready` — GET `/app_data/google/app_reviews/tasks_ready`
- `app_data_google_app_reviews_get` — GET `/app_data/google/app_reviews/task_get/advanced/${id}`
- `app_data_apple_app_listings_search` — POST `/app_data/apple/app_listings/search/live` (replaces broken `app_data_app_store_search`)
- `app_data_apple_app_info_post` — POST `/app_data/apple/app_info/task_post`
- `app_data_apple_app_info_ready` — GET `/app_data/apple/app_info/tasks_ready`
- `app_data_apple_app_info_get` — GET `/app_data/apple/app_info/task_get/advanced/${id}`
- `app_data_apple_app_reviews_post` — POST `/app_data/apple/app_reviews/task_post`
- `app_data_apple_app_reviews_ready` — GET `/app_data/apple/app_reviews/tasks_ready`
- `app_data_apple_app_reviews_get` — GET `/app_data/apple/app_reviews/task_get/advanced/${id}`

#### Business Data
- `business_data_tripadvisor_search_post` — POST `/business_data/tripadvisor/search/task_post`
- `business_data_tripadvisor_search_ready` — GET `/business_data/tripadvisor/search/tasks_ready`
- `business_data_tripadvisor_search_get` — GET `/business_data/tripadvisor/search/task_get/advanced/<id>`
- `business_data_tripadvisor_reviews_post` — POST `/business_data/tripadvisor/reviews/task_post`
- `business_data_tripadvisor_reviews_ready` — GET `/business_data/tripadvisor/reviews/tasks_ready`
- `business_data_tripadvisor_reviews_get` — GET `/business_data/tripadvisor/reviews/task_get/advanced/<id>`
- `business_data_trustpilot_search_post` — POST `/business_data/trustpilot/search/task_post`
- `business_data_trustpilot_search_ready` — GET `/business_data/trustpilot/search/tasks_ready`
- `business_data_trustpilot_search_get` — GET `/business_data/trustpilot/search/task_get/advanced/<id>`
- `business_data_trustpilot_reviews_post` — POST `/business_data/trustpilot/reviews/task_post`
- `business_data_trustpilot_reviews_ready` — GET `/business_data/trustpilot/reviews/tasks_ready`
- `business_data_trustpilot_reviews_get` — GET `/business_data/trustpilot/reviews/task_get/advanced/<id>`
- `business_data_social_media_pinterest_live` — POST `/business_data/social_media/pinterest/live`
- `business_data_social_media_reddit_live` — POST `/business_data/social_media/reddit/live`

#### Merchant
- `merchant_google_products_task_post` — POST `/merchant/google/products/task_post`
- `merchant_google_products_task_ready` — GET `/merchant/google/products/tasks_ready`
- `merchant_google_products_task_get` — GET `/merchant/google/products/task_get/advanced/{id}`
- `merchant_google_product_info_task_post` — POST `/merchant/google/product_info/task_post`
- `merchant_google_product_info_task_ready` — GET `/merchant/google/product_info/tasks_ready`
- `merchant_google_product_info_task_get` — GET `/merchant/google/product_info/task_get/advanced/{id}`
- `merchant_google_sellers_task_post` — POST `/merchant/google/sellers/task_post`
- `merchant_google_sellers_task_ready` — GET `/merchant/google/sellers/tasks_ready`
- `merchant_google_sellers_task_get` — GET `/merchant/google/sellers/task_get/advanced/{id}`
- `merchant_google_reviews_task_post` — POST `/merchant/google/reviews/task_post`
- `merchant_google_reviews_task_ready` — GET `/merchant/google/reviews/tasks_ready`
- `merchant_google_reviews_task_get` — GET `/merchant/google/reviews/task_get/advanced/{id}`
- `merchant_amazon_products_task_post` — POST `/merchant/amazon/products/task_post`
- `merchant_amazon_products_task_ready` — GET `/merchant/amazon/products/tasks_ready`
- `merchant_amazon_products_task_get` — GET `/merchant/amazon/products/task_get/advanced/{id}`
- `merchant_amazon_asin_task_post` — POST `/merchant/amazon/asin/task_post`
- `merchant_amazon_asin_task_ready` — GET `/merchant/amazon/asin/tasks_ready`
- `merchant_amazon_asin_task_get` — GET `/merchant/amazon/asin/task_get/advanced/{id}`

### Deprecated

#### SERP
- `serp_google_jobs_live`: no live endpoint exists on DataForSEO; returns friendly error directing to task-based tools
- `serp_baidu_organic_live`: no live endpoint exists on DataForSEO; returns friendly error directing to task-based tools
- `serp_google_shopping_live`: incorrect API namespace; returns friendly error directing to `merchant_google_products_task_post`

#### App Data
- `app_data_google_play_search`: wrong params and missing path segment; returns friendly error directing to `app_data_google_app_listings_search`
- `app_data_google_play_app_info`: no live endpoint; returns friendly error directing to task-based tools
- `app_data_google_play_reviews`: no live endpoint and wrong segment name (`reviews` vs `app_reviews`); returns friendly error
- `app_data_app_store_search`: wrong params and missing path segment; returns friendly error directing to `app_data_apple_app_listings_search`
- `app_data_app_store_app_info`: no live endpoint; returns friendly error directing to task-based tools
- `app_data_app_store_reviews`: no live endpoint and wrong segment name; returns friendly error

#### Business Data
- `business_data_google_hotels_reviews`: no dedicated endpoint; returns friendly error directing to `business_data_google_reviews`
- `business_data_tripadvisor_search`: no live endpoint; returns friendly error directing to task-based tools
- `business_data_tripadvisor_reviews`: no live endpoint; returns friendly error directing to task-based tools
- `business_data_trustpilot_search`: no live endpoint; returns friendly error directing to task-based tools
- `business_data_trustpilot_reviews`: no live endpoint; returns friendly error directing to task-based tools
- `business_data_facebook_search`: Facebook not supported by DataForSEO Business Data; returns friendly error
- `business_data_facebook_overview`: same as above
- `business_data_pinterest_search`: wrong namespace; returns friendly error directing to `business_data_social_media_pinterest_live`
- `business_data_pinterest_info`: same as above
- `business_data_reddit_search`: wrong namespace; returns friendly error directing to `business_data_social_media_reddit_live`
- `business_data_reddit_info`: same as above

#### Merchant
- `merchant_google_search`: no live endpoint; returns friendly error directing to task-based tools
- `merchant_google_product_specs`: not a real DataForSEO endpoint; returns friendly error directing to `merchant_google_product_info_task_post`
- `merchant_google_product_info`: no live endpoint; returns friendly error directing to task-based tools
- `merchant_google_sellers`: no live endpoint; returns friendly error directing to task-based tools
- `merchant_google_reviews`: no live endpoint; returns friendly error directing to task-based tools
- `merchant_amazon_search`: no live endpoint; returns friendly error directing to task-based tools
- `merchant_amazon_product_info`: no live endpoint; real endpoint is `/merchant/amazon/asin/`; returns friendly error
- `merchant_amazon_reviews`: temporarily unavailable per DataForSEO docs; returns friendly error

### Security
- `npm audit fix`: resolved 4 vulnerabilities in the `express` / `path-to-regexp` / `qs` / `body-parser` dependency chain. Two rounds of `npm audit fix` were needed; final state is `found 0 vulnerabilities`.

## [1.0.0] - upstream baseline
Initial release by Skobyn.
