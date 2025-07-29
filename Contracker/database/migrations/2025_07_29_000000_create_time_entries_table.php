<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id');
            $table->unsignedBigInteger('job_id');
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->text('face_in')->nullable();
            $table->text('signature_in')->nullable();
            $table->text('face_out')->nullable();
            $table->text('signature_out')->nullable();
            $table->timestamps();

            $table->foreign('device_id')->references('id')->on('contracker_devices')->onDelete('cascade');
            $table->foreign('job_id')->references('id')->on('contracker_jobs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_entries');
    }
};
