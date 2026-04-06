import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ConfigModule } from '@modules/config/config.module';
import { ConfigService } from '@modules/config/config.service';
import { DiscordModule } from '@modules/discord/discord.module';
import { RedisModule } from '@modules/redis/redis.module';
import { RedisService } from '@modules/redis/redis.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { SourcesModule } from '@sources/sources.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    RedisModule,
    BullModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (...args: unknown[]) => ({
        connection: (args[0] as RedisService).getConnectionOptions(),
      }),
    }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        driver: PostgreSqlDriver,
        host: config.get('POSTGRES_HOST'),
        port: config.get('POSTGRES_PORT'),
        user: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        dbName: config.get('POSTGRES_DB'),
        autoLoadEntities: true,
      }),
    }),
    EventEmitterModule.forRoot(),
    DiscordModule,
    SourcesModule,
  ],
})
export class AppModule {}
