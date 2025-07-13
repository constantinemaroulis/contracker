<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('contracker_cost_code_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_id');
            $table->unsignedBigInteger('timecard_id')->nullable(); // TODO: add foreign key to contracker_timecards when table is created
            $table->unsignedBigInteger('laborer_id');
            $table->unsignedBigInteger('cost_code_id');
            $table->decimal('hours', 5, 2)->default(0);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('job_id')->references('id')->on('contracker_jobs')->onDelete('cascade');
            $table->foreign('laborer_id')->references('id')->on('contracker_laborers')->onDelete('cascade');
            $table->foreign('cost_code_id')->references('id')->on('contracker_cost_codes')->onDelete('cascade');
            // foreign key for timecard_id will be added once contracker_timecards exists
        });
    }

    public function down()
    {
        Schema::dropIfExists('contracker_cost_code_assignments');
    }
};
