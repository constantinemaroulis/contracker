<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // If using PostgreSQL, you may need to enable the pgcrypto or uuid-ossp extension for UUID generation:
        // DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto";'); // for gen_random_uuid()
        // DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'); // for uuid_generate_v4()

        Schema::create('contracker_messages', function (Blueprint $table) {
            // Primary key: UUID id (with default generation for supported databases)
            if (Schema::getConnection()->getDriverName() === 'pgsql') {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            } else {
                // MySQL 8+ allows UUID() function as default (wrapped in parentheses):contentReference[oaicite:6]{index=6}
                $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            }

            // Conversation ID to group messages (indexed for faster queries by conversation)
            $table->uuid('conversation_id')->index();
            // Sender and receiver identifiers (could be user IDs or other IDs)
            $table->uuid('sender_id');
            $table->uuid('receiver_id');
            // Message content and status
            $table->text('message');
            $table->string('status')->nullable();
            // Timestamp when the message was read
            $table->timestamp('read_at')->nullable();
            // Laravel's created_at and updated_at columns
            $table->timestamps();
            // Soft deletes column (deleted_at):contentReference[oaicite:7]{index=7}
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('chat_messages');
    }
};
