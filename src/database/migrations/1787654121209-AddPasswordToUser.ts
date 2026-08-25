import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordToUser1787654121209 implements MigrationInterface {
    name = 'AddPasswordToUser1787654121209'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }

}
