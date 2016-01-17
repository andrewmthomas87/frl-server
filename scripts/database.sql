create database if not exists frl;

use frl;

create table if not exists users (
	id int primary key auto_increment,
	email varchar(254) not null unique,
	firstName varchar(100) not null,
	lastName varchar(100) not null,
	position tinyint(1) not null,
	password varchar(100) not null,
	slack varchar(100),
	admin tinyint(1) not null default 0
);

create table if not exists userPictures (
	id int primary key,
	picture blob not null
);

create table if not exists teams (
	teamNumber int primary key,
	name varchar(500) not null,
	website varchar(500),
	location varchar(100),
	rookieYear int,
	owner int
);

create table if not exists events (
	code varchar(10) primary key,
	name varchar(500) not null,
	type int not null,
	week int not null,
	location varchar(500) not null
);

create table if not exists teamEvents (
	teamNumber int not null,
	code varchar(10) not null
);

create table if not exists teamStats (
	teamNumber int not null,
	averageSeed float(5, 3) not null,
	averageCCWM float(6, 3) not null,
	eventWins int default 0
);

create table if not exists pickListTeams (
	id int not null,
	teamNumber int not null,
	listIndex int not null
);

create table if not exists activeTeams (
	id int not null,
	teamNumber int not null,
	week int not null
);
