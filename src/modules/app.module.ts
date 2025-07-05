
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { Member, Sport, SportSubscription } from '../entities';
import { MembersModule } from './member.module';
import { SportsModule } from './sports.module';
import { SportSubscriptionsModule } from './subscription.module';
import { MembersService } from '../services/member.services';
import { MembersController } from '../controllers/member.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // url: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'postgres',
      entities: [Member, Sport, SportSubscription],
      synchronize: true, // Only for development!
    }),
    MembersModule,
    SportsModule,
    SportSubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}