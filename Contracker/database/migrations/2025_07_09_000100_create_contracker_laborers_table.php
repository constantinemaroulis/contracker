<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('contracker_laborers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_id');
            $table->string('name');
            $table->string('local')->nullable();
            $table->decimal('original_hours', 5, 2)->default(0);
            $table->time('clock_in_time')->nullable();
            $table->time('clock_out_time')->nullable();
            $table->timestamps();

            $table->foreign('job_id')->references('id')->on('contracker_jobs')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('contracker_laborers');
    }
};
