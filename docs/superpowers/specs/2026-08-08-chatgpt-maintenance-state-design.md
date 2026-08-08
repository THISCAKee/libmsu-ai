# ChatGPT Maintenance State Design

## Goal

Keep ChatGPT visible in the AI platform list while clearly communicating that
it is temporarily unavailable. A user must not be able to open ChatGPT or
create a usage log while the platform is under maintenance.

## Domain Model

Add an optional `maintenance` flag to an AI platform. ChatGPT sets this flag to
`true`; all platforms without the flag remain available. This models temporary
availability as platform data instead of coupling the workspace UI to the
`chatgpt` identifier.

## User Interface

The ChatGPT card remains in search results and category filters, with its logo,
name, plan, category, and description unchanged. Its footer action is replaced
with a localized maintenance message:

- Thai: `อยู่ระหว่างการปรับปรุง`
- English: `Under maintenance`

The card uses subdued styling and a disabled cursor. It does not show external
link affordances or hover movement that suggests it can be opened. The card is
rendered as a non-interactive element rather than an anchor, so keyboard and
pointer users cannot activate it.

Available platform cards retain their current links, hover styling, and usage
logging behavior.

## Behavior and Data Flow

`data/platforms.ts` supplies the maintenance state. `AiWorkspace` branches only
at card rendering:

1. A maintenance platform renders a non-interactive card and localized status.
2. An available platform renders the existing external link.
3. Only the available-platform link invokes `handleCardClick`, so ChatGPT does
   not send a request to `/api/log`.

No API, admin-reporting, authentication, or stored-log schema changes are
required.

## Accessibility

The maintenance status is visible text, not color alone. The disabled card is
excluded from interactive keyboard navigation because it has no link or button
semantics. Existing platform links retain their accessible behavior.

## Testing

Add a focused presentation helper and test it before changing the UI. Tests
will verify that:

- ChatGPT resolves to a non-interactive maintenance presentation with the Thai
  and English status text.
- An available platform resolves to the existing link presentation.
- The component uses that presentation so maintenance cards have no `href` or
  click logging handler, while available cards remain unchanged.

Run the focused tests, the full test suite, TypeScript checking, and the
production build before completion.

## Out of Scope

- Hiding ChatGPT from the platform list.
- Adding maintenance dates, reasons, modals, or administrator controls.
- Changing availability for any platform other than ChatGPT.
