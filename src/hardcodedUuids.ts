export const hardcodedUsers: Map<string, string> = new Map([
  {
    id: '1caccb9b-2fe9-4750-9593-a575efb9f686',
    name: 'g.savchenko@subsquid.io'
  },
  {
    id: 'e526c962-3ad0-440c-8f05-26cc9ca6ca19',
    name: 'e.chertova@subsquid.io'
  },
  {
    id: '81adf2e2-d78f-45ea-975f-e82e8dcd5344',
    name: 'Dimitri Zhelezov'
  },
  {
    id: '34bb3ba1-859f-488b-ad0e-17c90f75399d',
    name: 'Evgeny Formanenko'
  },
  {
    id: '496d991b-1017-40d2-8f1a-e5e4da23955e',
    name: 'd.quirk@subsquid.io'
  },
  {
    id: '09650f95-03f1-4b90-9aed-76376984ee33',
    name: 'i.guimaraes@subsquid.io'
  },
  {
    id: '56930f29-5854-4289-b2e4-e40330023e56',
    name: 'Alexandr Belopashentsev'
  },
  {
    id: '94170462-9dea-44e6-80f8-30b6abb41f35',
    name: 'Evgeny Baburov'
  },
  {
    id: 'd43d2fd7-a4d5-4f7e-a45d-d7db9bf76849',
    name: 'Anton Bernatskiy'
  },
  { id: 'b868f19d-e78f-4cc8-abf5-daa2e45bddc8', name: 'Karel Balogh' }
].map(r => [r.name, r.id]));

export const hardcodedStates: Map<string, string> = new Map([
  { id: '8a6a9995-2b5c-4965-b941-962648b92171', name: 'Bugs & Issues' },
  { id: '0138e3c4-0c13-45d1-8a35-fe73df195ad1', name: 'New request' },
  { id: 'f2b3568e-9b75-4bad-8aaf-e546715ffa95', name: 'Design' },
  { id: 'e922ecff-46eb-480f-9f52-a6c7e07fa0c8', name: 'Docs pending' },
  { id: 'fe423ef6-0029-42fc-8771-987dfcc7de4e', name: 'Archive' },
  { id: 'b54f013e-15e8-4a9e-b036-8a106db81f2d', name: 'Ready' },
  { id: '497d9e7d-d329-4a71-a74f-b518ec90e7c8', name: 'New' },
  { id: 'd15d617b-13aa-4b29-bea2-453a2851e65b', name: 'Announcement' },
  { id: '35f19873-add7-4a2b-9f9f-aa00b3e59221', name: 'Active' },
  { id: '07f58cc3-7697-44f0-8147-262a35dd7e47', name: 'Unwanted' },
  { id: '7d6bf555-e439-47db-911e-22a778d34077', name: 'Review' },
  { id: '9e43e428-4f8a-4815-963a-08e59044ecda', name: 'Testing' },
  { id: 'bdfca832-778c-4032-a6f6-58120d5d2743', name: 'Triage' },
  { id: 'd443b2b4-016d-4ebd-ac29-476a7b94847e', name: 'Backlog' }
].map(r => [r.name, r.id]));

export const hardcodedTeams: Map<string, string> = new Map([
  { id: 'db85ad8e-2024-4e00-af47-9259b25d4c78', name: 'SQDGN' },
  { id: 'c86b7ead-6006-4eef-b68e-3042a75e2de6', name: 'Design' },
  { id: 'bd43ecd9-90c0-4214-a93e-9507382042aa', name: 'Operations' },
  {
    id: 'a85e4b04-f4bb-4612-8972-b17db625f7f5',
    name: 'BD/Partnerships'
  },
  { id: '077fbb5d-3a3b-4574-8e97-07f28acb1464', name: 'Marketing' },
  { id: '80bae9fa-5239-483b-b817-797afe2ee756', name: 'GoToMarket' },
  { id: '0763fdbd-c036-405b-9797-55136bbbb78f', name: 'Ingestion' },
  { id: '97a2fb37-20c9-42e3-ae56-04131eab008e', name: 'Network' },
  { id: '68aed7f9-f5e0-45aa-84f3-0efac7fb9fc8', name: 'SDK/Tooling' },
  { id: '0f5ef453-4003-431b-884f-bf71f74650e2', name: 'ENG' }
].map(r => [r.name, r.id]));
