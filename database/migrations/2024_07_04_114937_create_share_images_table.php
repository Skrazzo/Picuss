<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('share_images', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->foreignId('picture_id')->constrained();
            $table->integer('views')->unsigned()->default(0);
            $table->integer('downloads')->unsigned()->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('share_images');
    }
};
