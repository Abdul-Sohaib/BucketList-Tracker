import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'bucketListImages',

    access: (allow) => ({
        'bucket-list-images/*': [
            allow.authenticated.to([
                'read',
                'write',
                'delete',
            ]),
            allow.guest.to(['read']),
        ],
    }),
});