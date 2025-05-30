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
        Schema::create('contracker_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_no')->unique();
            $table->text('description');
            $table->string('address_1');
            $table->string('address_2')->nullable();
            $table->string('address_3')->nullable();
            $table->string('city');
            $table->string('state', 50);
            $table->string('zip', 20);
            $table->unsignedBigInteger('contract_id');
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('project_class_no');
            $table->unsignedBigInteger('project_manager_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracker_jobs');
    }
};
