import { FractionalProperty, SavingsVault } from "generated";

FractionalProperty.PropertyListed.handler(async ({ event, context }) => {
    const entity = {
        id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
        propertyId: event.params.propertyId,
        pricePerShare: event.params.pricePerShare,
    };

    context.FractionalProperty_PropertyListed.set(entity);
});

FractionalProperty.SharesPurchased.handler(async ({ event, context }) => {
    const entity = {
        id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
        propertyId: event.params.propertyId,
        buyer: event.params.buyer,
        amount: event.params.amount,
    };

    context.FractionalProperty_SharesPurchased.set(entity);
});

SavingsVault.Saved.handler(async ({ event, context }) => {
    const entity = {
        id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
        user: event.params.user,
        propertyId: event.params.propertyId,
        amount: event.params.amount,
    };

    context.SavingsVault_Saved.set(entity);
});

SavingsVault.Withdrawn.handler(async ({ event, context }) => {
    const entity = {
        id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
        user: event.params.user,
        propertyId: event.params.propertyId,
        amount: event.params.amount,
    };

    context.SavingsVault_Withdrawn.set(entity);
});
