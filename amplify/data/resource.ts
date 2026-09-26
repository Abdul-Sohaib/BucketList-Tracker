import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
    BucketListItem: a
        .model({
            title: a.string().required(),
            description: a.string(),
            category: a.string(),
            priority: a.string(),
            targetDate: a.string(),
            imageKey: a.string(),
            completed: a.boolean().default(false),
            createdAt: a.datetime(),
        })
        .authorization((allow) => [
            allow.owner(),
        ]),
});


export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,

    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
    },
});