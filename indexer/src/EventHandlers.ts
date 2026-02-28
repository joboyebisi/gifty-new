import { EphemeralNotes } from "generated";

EphemeralNotes.NoteCreated.handler(async ({ event, context }) => {
    context.Note.set({
        id: event.params.note.ephemeralOwner,
        sender: event.params.note.sender,
        amount: event.params.note.amount,
        isRedeemed: false,
        redeemer: null,
        createdAtTimestamp: event.block.timestamp,
        redeemedAtTimestamp: null,
    });
});

EphemeralNotes.NoteRedeemed.handler(async ({ event, context }) => {
    context.Note.set({
        id: event.params.note.ephemeralOwner,
        sender: event.params.note.sender,
        amount: event.params.note.amount,
        isRedeemed: true,
        redeemer: event.params.redeemer,
        createdAtTimestamp: 0, // This will be merged with the existing entity
        redeemedAtTimestamp: event.block.timestamp,
    });
});
