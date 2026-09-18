CREATE TABLE "post_media" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_media_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "post_media_postId_position_key" ON "post_media"("postId", "position");
CREATE INDEX "post_media_postId_idx" ON "post_media"("postId");

ALTER TABLE "post_media" ADD CONSTRAINT "post_media_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "post_media" ("postId", "url", "type", "position")
SELECT "id", "mediaUrl", COALESCE("mediaType", 'image'::"MediaType"), 0
FROM "posts"
WHERE "mediaUrl" IS NOT NULL;
