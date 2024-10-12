<?php

namespace App\Helpers;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class Users
{
    /**
     * Delete a user and all of their images.
     *
     * This function will delete a user and all of their images.
     * It will throw an exception if the user cannot be found,
     * or if any of the images cannot be deleted.
     *
     * @param int $id The id of the user to delete
     *
     * @return bool True if the user was deleted successfully
     *
     * @throws Exception If the user cannot be found, or if any of the images cannot be deleted
     */
    public static function delete(int $id): bool
    {
        $user = User::findOrFail($id);
        $disks = Disks::allDisks();

        // Delete every picture
        $pictures = $user->picture()->get();
        foreach ($pictures as $picture) {
            foreach ($disks as $disk) {
                $success = $disk->delete($picture->image);
                if (!$success) {
                    throw new Exception("Could not delete $user->username $picture->image from $disk disk.");
                }
            }

            if (!$picture->delete()) {
                throw new Exception("Could not delete $user->username $picture->image from database.");
            }
        }

        // Delete everything from the database
        try {
            $user->sharedImage()->delete();
            $user->tag()->delete();
            $user->pin()->delete();
            $user->delete();
        } catch (\Exception $e) {
            throw new Exception($e);
        }

        // Return true at the end, if everything succeeded
        return true;
    }
}
