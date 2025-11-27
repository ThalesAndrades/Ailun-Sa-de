CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(64) NOT NULL,
	`beneficiaryId` int NOT NULL,
	`specialtyId` varchar(64),
	`specialtyName` text,
	`scheduledDate` timestamp NOT NULL,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`rapidocData` text,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`),
	CONSTRAINT `appointments_uuid_unique` UNIQUE(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `beneficiaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(64) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`birthDate` varchar(10),
	`gender` varchar(20),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`rapidocData` text,
	CONSTRAINT `beneficiaries_id` PRIMARY KEY(`id`),
	CONSTRAINT `beneficiaries_uuid_unique` UNIQUE(`uuid`),
	CONSTRAINT `beneficiaries_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `specialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rapidocId` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`available` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `specialties_id` PRIMARY KEY(`id`),
	CONSTRAINT `specialties_rapidocId_unique` UNIQUE(`rapidocId`)
);
