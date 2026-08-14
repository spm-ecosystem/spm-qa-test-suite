# QA Environment: Site C - Admin Panel

This environment tests `UiStatsDashboard`, `UiTable`, and `UiTableListPage`.

## Focus Areas
- Horizontal scroll overflow on wide data tables (> 15 columns).
- Asynchronous load handling under network latency (timeout > 5s).
- Robustness against uncleaned currency / numeric strings ("$ 1,500.20", "NaN").
