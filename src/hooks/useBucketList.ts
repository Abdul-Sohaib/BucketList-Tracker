import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';

import type { Schema } from '../../amplify/data/resource';

import type {
  BucketListItem,
  BucketPriority,
} from '../types/bucket';

import {
  uploadBucketImage,
  deleteBucketImage,
} from '../utils/storage';

const client = generateClient<Schema>({
  authMode: 'userPool',
});

export type BucketItemUpdate = Partial<
  Omit<BucketListItem, 'id' | 'createdAt' | 'imageKey'>
> & {
  imageFile?: File | null;
};

export function useBucketList(enabled: boolean) {
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Load the signed-in user's bucket-list items.
   */
  const loadItems = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const currentUser = await getCurrentUser().catch(
        () => null
      );

      if (!currentUser) {
        setItems([]);
        return;
      }

      const { data, errors } =
        await client.models.BucketListItem.list({
          authMode: 'userPool',
        });

      if (errors && errors.length > 0) {
        console.error(
          'Error loading bucket items:',
          errors
        );
        return;
      }

      const bucketItems: BucketListItem[] = (
        data ?? []
      ).map((item) => ({
        id: item.id,
        title: item.title ?? '',
        description: item.description ?? '',
        category: item.category ?? '',
        priority: (item.priority ??
          'MEDIUM') as BucketPriority,
        targetDate: item.targetDate ?? '',
        imageKey: item.imageKey ?? '',
        completed: item.completed ?? false,
        createdAt: item.createdAt ?? '',
      }));

      setItems(bucketItems);
    } catch (error) {
      console.error(
        'Failed to load bucket items:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  /**
   * Create a new bucket-list item.
   */
  const addBucketItem = async (
    title: string,
    description: string,
    category: string,
    priority: BucketPriority,
    targetDate: string,
    imageFile: File | null
  ): Promise<BucketListItem | null> => {
    let uploadedImageKey = '';

    try {
      const currentUser = await getCurrentUser().catch(
        () => null
      );

      if (!currentUser) {
        console.log('No user signed in');
        return null;
      }

      /**
       * Upload image first, if provided.
       */
      if (imageFile) {
        uploadedImageKey =
          await uploadBucketImage(imageFile);
      }

      /**
       * Create DynamoDB/AppSync record.
       */
      const { data, errors } =
        await client.models.BucketListItem.create(
          {
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            priority,
            targetDate,
            completed: false,
            imageKey:
              uploadedImageKey || undefined,
          },
          {
            authMode: 'userPool',
          }
        );

      if (errors && errors.length > 0) {
        console.error(
          'Error creating bucket item:',
          errors
        );

        /**
         * If database creation fails,
         * remove the already-uploaded image.
         */
        if (uploadedImageKey) {
          await deleteBucketImage(
            uploadedImageKey
          ).catch((cleanupError) => {
            console.error(
              'Could not clean up uploaded image:',
              cleanupError
            );
          });
        }

        return null;
      }

      if (!data) {
        if (uploadedImageKey) {
          await deleteBucketImage(
            uploadedImageKey
          ).catch(() => { });
        }

        return null;
      }

      const newItem: BucketListItem = {
        id: data.id,
        title: data.title,
        description: data.description ?? '',
        category: data.category ?? '',
        priority: (data.priority ??
          'MEDIUM') as BucketPriority,
        targetDate: data.targetDate ?? '',
        imageKey: data.imageKey ?? '',
        completed: data.completed ?? false,
        createdAt: data.createdAt ?? '',
      };

      setItems((currentItems) => [
        newItem,
        ...currentItems,
      ]);

      return newItem;
    } catch (error) {
      console.error(
        'Failed to create bucket item:',
        error
      );

      if (uploadedImageKey) {
        await deleteBucketImage(
          uploadedImageKey
        ).catch(() => { });
      }

      return null;
    }
  };

  /**
   * Update an existing bucket-list item.
   */
  const updateBucketItem = async (
    id: string,
    updatedFields: BucketItemUpdate
  ): Promise<boolean> => {
    let newImageKey = '';
    let oldImageKey = '';

    try {
      const currentUser = await getCurrentUser().catch(
        () => null
      );

      if (!currentUser) {
        console.log('No user signed in');
        return false;
      }

      const existingItem = items.find(
        (item) => item.id === id
      );

      oldImageKey = existingItem?.imageKey ?? '';

      /**
       * Upload replacement image if provided.
       */
      if (updatedFields.imageFile instanceof File) {
        newImageKey =
          await uploadBucketImage(
            updatedFields.imageFile
          );
      }

      const { data, errors } =
        await client.models.BucketListItem.update(
          {
            id,

            ...(updatedFields.title !== undefined && {
              title: updatedFields.title.trim(),
            }),

            ...(updatedFields.description !==
              undefined && {
              description:
                updatedFields.description.trim(),
            }),

            ...(updatedFields.category !==
              undefined && {
              category:
                updatedFields.category.trim(),
            }),

            ...(updatedFields.priority !==
              undefined && {
              priority: updatedFields.priority,
            }),

            ...(updatedFields.targetDate !==
              undefined && {
              targetDate:
                updatedFields.targetDate,
            }),

            ...(updatedFields.completed !==
              undefined && {
              completed:
                updatedFields.completed,
            }),

            ...(newImageKey && {
              imageKey: newImageKey,
            }),
          },
          {
            authMode: 'userPool',
          }
        );

      if (errors && errors.length > 0) {
        console.error(
          'Error updating bucket item:',
          errors
        );

        if (newImageKey) {
          await deleteBucketImage(
            newImageKey
          ).catch(() => { });
        }

        return false;
      }

      if (!data) {
        if (newImageKey) {
          await deleteBucketImage(
            newImageKey
          ).catch(() => { });
        }

        return false;
      }

      /**
       * Remove old image after successful update.
       */
      if (
        newImageKey &&
        oldImageKey &&
        oldImageKey !== newImageKey
      ) {
        await deleteBucketImage(
          oldImageKey
        ).catch((cleanupError) => {
          console.error(
            'Could not delete old image:',
            cleanupError
          );
        });
      }

      const updatedItem: BucketListItem = {
        id: data.id,
        title: data.title,
        description: data.description ?? '',
        category: data.category ?? '',
        priority: (data.priority ??
          'MEDIUM') as BucketPriority,
        targetDate: data.targetDate ?? '',
        imageKey: data.imageKey ?? '',
        completed: data.completed ?? false,
        createdAt:
          data.createdAt ??
          existingItem?.createdAt ??
          '',
      };

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? updatedItem
            : item
        )
      );

      return true;
    } catch (error) {
      console.error(
        'Failed to update bucket item:',
        error
      );

      if (newImageKey) {
        await deleteBucketImage(
          newImageKey
        ).catch(() => { });
      }

      return false;
    }
  };

  /**
   * Delete bucket-list item and its S3 image.
   */
  const deleteBucketItem = async (
    id: string
  ): Promise<boolean> => {
    try {
      const currentUser = await getCurrentUser().catch(
        () => null
      );

      if (!currentUser) {
        console.log('No user signed in');
        return false;
      }

      const existingItem = items.find(
        (item) => item.id === id
      );

      const { errors } =
        await client.models.BucketListItem.delete(
          {
            id,
          },
          {
            authMode: 'userPool',
          }
        );

      if (errors && errors.length > 0) {
        console.error(
          'Error deleting bucket item:',
          errors
        );

        return false;
      }

      /**
       * Remove associated image from S3.
       */
      if (existingItem?.imageKey) {
        await deleteBucketImage(
          existingItem.imageKey
        ).catch((cleanupError) => {
          console.error(
            'Bucket item deleted, but image cleanup failed:',
            cleanupError
          );
        });
      }

      setItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== id
        )
      );

      return true;
    } catch (error) {
      console.error(
        'Failed to delete bucket item:',
        error
      );

      return false;
    }
  };

  /**
   * Toggle completed status.
   */
  const toggleComplete = async (
    id: string
  ): Promise<boolean> => {
    const item = items.find(
      (currentItem) => currentItem.id === id
    );

    if (!item) {
      return false;
    }

    return updateBucketItem(id, {
      completed: !item.completed,
    });
  };

  return {
    items,
    loading,
    addBucketItem,
    updateBucketItem,
    deleteBucketItem,
    toggleComplete,
    refreshItems: loadItems,
  };
}