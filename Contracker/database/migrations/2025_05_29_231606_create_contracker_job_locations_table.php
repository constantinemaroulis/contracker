<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('contracker_jobs_location', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_id');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamps();

            // Foreign key linking to contracker_jobs
            $table->foreign('job_id')->references('id')->on('contracker_jobs')->onDelete('cascade');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracker_job_locations');
    }
};
