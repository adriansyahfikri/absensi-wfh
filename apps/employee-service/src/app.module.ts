import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Database connection. All values come from config (.env / container env),
    // which is what satisfies the "connect to any database" objective — swap
    // the driver here and nothing else changes.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_NAME', 'wfh_attendance'),
        autoLoadEntities: true,
        // synchronize auto-creates tables from entities. Convenient for this
        // test; in production you would use migrations instead.
        synchronize: true,
      }),
    }),

    EmployeeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
