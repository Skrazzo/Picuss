<?php
namespace App\Helpers;

use Illuminate\Support\Carbon;

class Dates
{
    public static function formatDateDifference($date, $format = "d.m.Y H:i")
    {
        $date = Carbon::parse($date);
        return [
            "date" => $date->format($format),
            "human" => $date->diffForHumans(),
        ];
    }
}
