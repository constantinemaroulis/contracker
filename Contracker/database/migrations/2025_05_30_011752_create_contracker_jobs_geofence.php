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
        Schema::create('contracker_jobs_geofence', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_location_id');
            $table->json('boundary_points'); // Stores geofence coordinates
            $table->timestamps();

            // Foreign key linking to contracker_jobs_location
            $table->foreign('job_location_id')->references('id')->on('contracker_jobs_location')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('contracker_jobs_geofence');
    }
};
