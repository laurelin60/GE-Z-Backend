-- CreateTable
CREATE TABLE "geCourseLists" (
    "id" SERIAL NOT NULL,
    "institution" TEXT NOT NULL,
    "geCategory" TEXT NOT NULL,

    CONSTRAINT "geCourseLists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cvcCourses" (
    "id" SERIAL NOT NULL,
    "targetInstitution" TEXT NOT NULL,
    "sendingInstitution" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "cvcId" TEXT NOT NULL,
    "niceToHaves" TEXT[],
    "units" DOUBLE PRECISION NOT NULL,
    "term" TEXT NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "startDay" INTEGER NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "endDay" INTEGER NOT NULL,
    "tuition" INTEGER NOT NULL,
    "async" BOOLEAN NOT NULL,
    "hasOpenSeats" BOOLEAN NOT NULL,
    "hasPrereqs" BOOLEAN NOT NULL,
    "instantEnrollment" BOOLEAN NOT NULL,
    "assistPath" TEXT NOT NULL,
    "articulatesTo" TEXT[],
    "fulfillsGEs" TEXT[],
    "geCourseListId" INTEGER NOT NULL,

    CONSTRAINT "cvcCourses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "geCourseLists_geCategory_institution_key" ON "geCourseLists"("geCategory", "institution");

-- AddForeignKey
ALTER TABLE "cvcCourses" ADD CONSTRAINT "cvcCourses_geCourseListId_fkey" FOREIGN KEY ("geCourseListId") REFERENCES "geCourseLists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
