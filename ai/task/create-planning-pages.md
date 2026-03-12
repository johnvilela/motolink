# Create Planning Page

You should create the page for the planning model. It will be a private route "/operacional/planejamento". A weekly delivery staffing planner where each client has a row showing the expected number of delivery drivers per day of the week and shift (day/night), allowing managers to plan workforce demand for each location.

## Headers and Filters

this route will have 2 filters, both will be a @/src/components/ui/combobox.tsx, the first one will be a a filter by group (only the groups related to the selected branch) and the other one will be filter by client (only the clients related to the selected branch), it should bring just some groups/clients but accept typing to filter the options, when the some option is selected it should save it on the url as a searchParameter, if one group is selected the client filter is cleaned, if one client is selected the group filter is cleaned, you can never have both. Both filters should be aligned to the left. On the same row, but on the right side, must be a component to change the week, something similar to "< 09/03/2026 - 15/03/2026 >", the arrow must be a icon button ( @/src/components/ui/button.tsx ), with the initial data starting on the monday (09/03/2026) and the last day being sunday (15/03/2026).

## Content

The content will be a list of the clients from a group or single card for the selected client. A client planning card that displays a single restaurant/location and its weekly delivery staffing forecast.

The card shows the client name, full address, and additional notes (for example: whether the client provides meals). To the right, there is a weekly grid organized by days of the week (Monday–Sunday). For each day, the expected number of delivery drivers is defined for two work periods: day shift (Diurno) and night shift (Noturno).

Each cell in the grid represents the planned number of delivery drivers required for that specific client, day, and shift, allowing quick adjustments and visual comparison across the week. This structure enables managers to plan workforce demand per location, ensuring enough delivery personnel are scheduled for each shift.

## Logic

It should use the @/src/modules/planning and it may be necessary to create some server action to this page. If the day has no planned information, it must show just 0, when the user updates the value and the input lose focus it should save the information. It should not be able to edit/create information to days past the current day (the UX should show the inputs disabled with the existent data for data day). The current day (today) the column with the inputs should have a highlight.

- Plan this carefully
- Ask me question to refine the task before execute it
- Run "tsc --noEmit" and "pnpm run lint" to check the code quality
