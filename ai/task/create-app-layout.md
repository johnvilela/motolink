---
name: create-app-layout
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# Create App Layout

You will create the app layout that will wrap the private routes. It will use the components existent on the "@src/components/ui". It will create a component on the path "@src/components/composite/app-layout", since it is a big component it should follow these structure:

| app-layout
|- index.tsx
|- app-layout-sidebar.tsx # it will contain the navigation links
|- app-layout-navbar.tsx # it will contain the sidebar trigger on the left side and the actions on the right side
|- app-layout-actions.tsx # it will contain the user name, email and avatar and some actions

## Sidebar

It should use the file "@src/constants/navigation-items.ts" to render the link, the object with items should render the links inside a collapsable component, the subitems won't have icons. The collapsable should start closed. The sidebar should start visible on the the desktop but closed on the mobile.

## Navbar

It should have a 64px height, on the left side will be the sidebar trigger and the app-layout-actions on the right.

## Actions

It should have the User avatar, the name and email (name above the email on desktop and both hidden on the mobile), it will have a dropdown-menu component with a red logout button inside (icon: LogOut; text: Sair da conta). Beside this should have another dropdown-menu that will display all the branches registered. On mobile it will show the selected branch on the center of the screen, on desktop it should be besides the user information. When changing the branch it should set on the cookies (check the @src/constants/cookies.ts) and reload the page.

## Important

- follow the next best pratices, not all components need to be client components
- do not comment anything with git, i'll evaluate it manually
- follow the code pattern for naming
- run "tsc --noEmit" and "pnpm run lint" to check the code quality
- you can suggest improvement on the structure to help reach the best UX on desktop and mobile
- ask me anything to clarify the task before executing it
