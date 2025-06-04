<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contracker_devices', function (Blueprint $table) {
            $table->string('local_ip')->nullable();
            $table->string('public_ip')->nullable();
            $table->string('mac_address')->nullable();
            $table->text('device_details')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('contracker_devices', function (Blueprint $table) {
            $table->dropColumn([
                'local_ip', 'public_ip', 'mac_address', 'device_details'
            ]);
        });
    }
};
