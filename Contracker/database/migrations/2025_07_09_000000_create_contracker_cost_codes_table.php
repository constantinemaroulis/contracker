<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('contracker_cost_codes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_id');
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('job_id')->references('id')->on('contracker_jobs')->onDelete('cascade');
            $table->unique(['job_id', 'code']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('contracker_cost_codes');
    }
};
