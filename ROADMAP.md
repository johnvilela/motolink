# ROADMAP
## Tasks
 - [x] Initiate project structure, configure editorconfig and biome
 - [x] Add metadata and static files (imgs)
 - [x] Configure shadcn
 - [x] Configure prisma-orm
 - [x] Import migrations from server project
 - [x] Create "sessions" table
 - [x] Create privates and public routes
 - [x] Create authentication functionality
 - [x] Create app layout
 - [x] Create file import functionality (using firebase storage)
 - [ ] Configure test suit with vitest and dockerfile
 - [x] Create users module (UI/Back)
 - [x] Create whatsapp service
 - [x] Create permissions control
 - [ ] Create region module (UI/Back)
 - [ ] Create group module (UI/Back)
 - [ ] Create client module (UI/Back)
 - [ ] Create delvierymen module (UI/Back)
 - [ ] Create planning functionality (UI/Back)
 - [ ] Create daily monitoring functionality (UI/Back)¹
 - [ ] Create weekly monitoring functionality (UI/Back)¹
 - [ ] Create copy'n paste functionality (daily/weekly)²,⁴
 - [ ] Create block deliveryman functionality (daily)³
 - [ ] Create financial module (UI/Back)
 - [ ] Integrate with some bank

## Anotation
1. A deliveryman cannot be assigned to a workshift that has overlaping hours, for example: the deliveryman has a work-shift on 01/02/2026 from 12:00 to 18:00, it cannot be assigned to a work-shift on 01/02/2026 from 17:00 to 22:00;
2. If one of the workshift copied has a deliveryman with overlaping hour, it should copy the work-shift without the deliveryman and warn the user about the overlaping problem
3. A blocked deliveryman should not be assigned on the client where it was blocked
4. If the day has some slots planned and the user copy and paste the same day, it should fill the planend slots with the copied data
