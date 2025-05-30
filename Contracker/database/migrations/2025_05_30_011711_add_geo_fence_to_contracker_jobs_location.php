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
        Schema::table('contracker_jobs_location', function (Blueprint $table) {
            $table->boolean('geo_fence')->default(false);
        });
    }

    public function down()
    {
        Schema::table('contracker_jobs_location', function (Blueprint $table) {
            $table->dropColumn('geo_fence');
        });
    }
};
