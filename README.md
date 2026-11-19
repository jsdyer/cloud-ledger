# Cloud Ledger

[Open Cloud Ledger](https://coolcode.ca/cloud-ledger/)

<!-- coolcode:guide -->
Filter to ThinkOn and open reference C-2026-2027-Q2-00919. The RCMP reported an original contract value of $192,894.74 in 2026–27 Q2. Selecting amendments instead shows the signed changes disclosed for that vendor.
<!-- /coolcode:guide -->

The launch covers 5,501 rows across 81 institutions and seven matched supplier families from 2021–22 Q1 through 2026–27 Q2. Select a supplier, department, reporting year and instrument together. Search the original vendor wording, reference, procurement ID or commodity description. The CSV preserves monetary values in integer Canadian cents.

Base-contract totals count the original amounts of records coded C. Amendment totals sum signed amendment amounts on A records. The full contract value can recur across filings, so that column stays at row level. Other instrument types remain visible separately. A missing amount is labelled and excluded from its sum. The chart counts filings by supplier family.

The importer reads the full federal CSV and uses an explicit case/punctuation-normalized vendor alias list. It includes Compugen, Softchoice and ThinkOn as well as multinational vendors. A reseller can supply competing products, and a matched technology company can supply goods unrelated to cloud services. Department and procurement IDs remain as reported. The source does not disclose invoices or the hosting location. It cannot support a national share of money paid to foreign-owned cloud providers.

[Open Government contract dataset and data dictionary](https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b). Contains information licensed under the Open Government Licence – Canada. Source refreshes run weekly. Use `python scripts/refresh.py` or pass `--file contracts.csv` for a downloaded source file.

## Development

Run `node --test tests/*.test.mjs`, `python -m unittest discover -s tests` and `python scripts/build.py`. Submit reviewed data and code together. Every Pages deployment runs its desktop and mobile browser checks first.
