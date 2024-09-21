<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class Encrypt
{
    /**
     * Encrypts a file with a given password, using AES-256-CBC.
     *
     * @param Storage $storage The storage to use
     * @param string $file The file name to encrypt
     * @param string $password The password to encrypt with
     *
     * @return void
     */
    public static function encrypt($storage, string $file, string $password)
    {
        try {
            $encrypted = openssl_encrypt(
                $storage->get($file),
                "AES-256-CBC",
                $password,
                OPENSSL_RAW_DATA,
                substr(sha1($password), 0, 16)
            );
            $storage->put($file, $encrypted);
        } catch (\Exception $e) {
            throw new \Exception("Error encrypting $file");
        }
    }

    /**
     * Decrypts a file with a given password, using AES-256-CBC.
     *
     * @param Storage $storage The storage to use
     * @param string $file The file name to decrypt
     * @param string $password The password to decrypt with
     *
     * @return string The decrypted file contents
     */
    public static function decrypt($storage, string $file, string $password)
    {
        $encrypted = $storage->get($file);
        $decrypted = openssl_decrypt(
            $encrypted,
            "AES-256-CBC",
            $password,
            OPENSSL_RAW_DATA,
            substr(sha1($password), 0, 16)
        );
        return $decrypted;
    }

    /**
     * Decrypts a file with a given password, using AES-256-CBC,
     * and returns the decrypted file contents as a base64 encoded string,
     * prefixed with "data:image/jpeg;base64,".
     *
     * @return string The decrypted file contents as a base64 encoded string
     *
     * @throws \Exception If there is an error decrypting the file
     */
    public static function decrypt2Base64($storage, string $fileName, string $password)
    {
        try {
            $decrypted = self::decrypt($storage, $fileName, $password);
            return "data:image/jpeg;base64," . base64_encode($decrypted);
        } catch (\Exception $e) {
            throw new \Exception("Error decrypting $fileName");
        }
    }
    /**
     * Encrypts multiple files across multiple storages with a single password.
     *
     * @param array $storages A list of Storage instances to encrypt files on
     * @param array $files A list of file names to encrypt
     * @param string $password The password to encrypt with
     *
     * @return void
     */
    public static function encryptFiles(array $storages, array $files, string $password)
    {
        foreach ($storages as $storage) {
            foreach ($files as $file) {
                self::encrypt($storage, $file, $password);
            }
        }
    }
}
