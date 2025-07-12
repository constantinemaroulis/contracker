<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // TODO: Define contracker_timecards table structure
        Schema::create('contracker_timecards', function (Blueprint $table) {
            $table->id();
            // $table->unsignedBigInteger('job_id'); // Example column
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('contracker_timecards');
    }
};
