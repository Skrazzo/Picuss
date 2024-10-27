<?php

namespace App\Helpers;

use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class Encrypt
{
    /**
     * Checks if the user is authenticated with the correct pin code.
     * If user is not logged in, returns false.
     * If pin is not set, returns false.
     * If pin code is not set in the session, returns false.
     * If the pin code in the session does not match the hash in the database, returns false.
     * Otherwise returns true.
     *
     * @return bool
     */
    public static function authorized()
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }
        $pinHash = $user->pin()->first() ? $user->pin()->first()->hash : null;

        if (!$pinHash) {
            return false;
        }

        if (session()->has("pin") && Hash::check(session("pin"), $pinHash)) {
            return true;
        }
        return false;
    }

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
        if (self::isEncrypted($storage, $file)) {
            throw new Exception("File $file is already encrypted");
        }

        $encrypted = openssl_encrypt(
            $storage->get($file),
            "AES-256-CBC",
            $password,
            OPENSSL_RAW_DATA,
            substr(sha1($password), 0, 16)
        );
        return $encrypted;
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
        if (!self::isEncrypted($storage, $file)) {
            throw new Exception("File $file is already decrypted");
        }

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
            throw new \Exception("Error decrypting $fileName " . $e->getMessage());
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
        // Catch errors in array if any appear
        $errors = [];
        foreach ($storages as $storage) {
            foreach ($files as $file) {
                try {
                    $encrypted = self::encrypt($storage, $file, $password);
                    $storage->put($file, $encrypted);
                } catch (Exception $e) {
                    $errors[] = $e->getMessage();
                }
            }
        }

        if (!empty($errors)) {
            throw new Exception(implode("\n", $errors));
        }
    }

    public static function decryptFiles(array $storages, array $files, string $password)
    {
        // Array of errors if any appear
        $errors = [];
        foreach ($storages as $storage) {
            foreach ($files as $file) {
                try {
                    $decrypted = self::decrypt($storage, $file, $password);
                    $storage->put($file, $decrypted);
                } catch (Exception $e) {
                    $errors[] = $e->getMessage();
                }
            }
        }

        if (!empty($errors)) {
            throw new Exception(implode("\n", $errors));
        }
    }

    /**
     * Common image signatures (magic numbers) and their corresponding formats
     */
    private static $IMAGE_SIGNATURES = [
        "jpeg" => [
            "\xFF\xD8\xFF\xE0", // JPEG/JFIF
            "\xFF\xD8\xFF\xE1", // JPEG/Exif
            "\xFF\xD8\xFF\xE8", // JPEG/SPIFF
        ],
        "png" => [
            "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A", // PNG
        ],
        "gif" => [
            "GIF87a", // GIF87a
            "GIF89a", // GIF89a
        ],
        "bmp" => [
            "BM", // BMP
        ],
        "webp" => [
            "RIFF", // WebP
        ],
    ];

    /**
     * Checks if a file is encrypted, with special handling for images.
     *
     * @param Storage $storage The storage to use
     * @param string $file The file name to check
     * @return bool Returns true if the file appears to be encrypted
     */
    public static function isEncrypted($storage, string $file): bool
    {
        $content = $storage->get($file);

        if (empty($content)) {
            return false;
        }

        // First, check if it's a valid image
        if (self::isValidImage($content)) {
            return false; // Valid images are not encrypted
        }

        // If it's not a valid image but has an image extension, it might be encrypted
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];

        if (in_array($extension, $imageExtensions)) {
            return true; // Invalid image with image extension is likely encrypted
        }

        // For non-image files, perform general encryption detection
        $checks = [
            "entropy" => self::calculateEntropy($content) > 7.5,
            "binary" => self::containsBinary($content),
            "block_size" => strlen($content) % 16 === 0,
        ];

        return !empty(array_filter($checks));
    }

    /**
     * Checks if the content is a valid image by examining its signature
     * and attempting basic format validation.
     *
     * @param string $content The file content to check
     * @return bool Returns true if content appears to be a valid image
     */
    private static function isValidImage(string $content): bool
    {
        // Check file signatures (magic numbers)
        foreach (self::$IMAGE_SIGNATURES as $format => $signatures) {
            foreach ($signatures as $signature) {
                if (str_starts_with($content, $signature)) {
                    // Additional format-specific checks
                    switch ($format) {
                        case "jpeg":
                            // Check for JPEG end marker
                            return str_ends_with($content, "\xFF\xD9");

                        case "png":
                            // Check for PNG IEND chunk
                            return str_contains($content, "IEND");

                        case "gif":
                            // Check for GIF trailer
                            return str_ends_with($content, "\x00\x3B");

                        default:
                            // For other formats, signature match is enough
                            return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Helper function for str_starts_with() compatibility with PHP < 8.0
     */
    private static function str_starts_with(string $haystack, string $needle): bool
    {
        return strpos($haystack, $needle) === 0;
    }

    /**
     * Helper function for str_ends_with() compatibility with PHP < 8.0
     */
    private static function str_ends_with(string $haystack, string $needle): bool
    {
        $length = strlen($needle);
        if ($length === 0) {
            return true;
        }
        return substr($haystack, -$length) === $needle;
    }

    private static function calculateEntropy(string $data): float
    {
        $frequencies = array_fill(0, 256, 0);
        $dataLength = strlen($data);

        // Count byte frequencies
        for ($i = 0; $i < $dataLength; $i++) {
            $frequencies[ord($data[$i])]++;
        }

        // Calculate entropy
        $entropy = 0.0;
        foreach ($frequencies as $frequency) {
            if ($frequency === 0) {
                continue;
            }

            $probability = $frequency / $dataLength;
            $entropy -= $probability * log($probability, 2);
        }

        return $entropy;
    }

    private static function containsBinary(string $data): bool
    {
        $suspiciousBytes = 0;
        $sampleSize = min(strlen($data), 512);

        for ($i = 0; $i < $sampleSize; $i++) {
            $byte = ord($data[$i]);
            if (($byte < 9 || ($byte > 13 && $byte < 32)) && $byte != 27) {
                $suspiciousBytes++;
            }
        }

        return $suspiciousBytes / $sampleSize > 0.3;
    }
}
