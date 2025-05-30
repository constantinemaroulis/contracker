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
        Schema::table('contracker_devices', function (Blueprint $table) {
            if (!Schema::hasColumn('contracker_devices', 'job_id')) {
                $table->unsignedBigInteger('job_id')->nullable();

                // Foreign key linking to contracker_jobs_location
                $table->foreign('job_id')->references('job_id')->on('contracker_jobs_location')->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        Schema::table('contracker_devices', function (Blueprint $table) {
            $table->dropForeign(['job_id']);
            $table->dropColumn('job_id');
        });
    }
};
