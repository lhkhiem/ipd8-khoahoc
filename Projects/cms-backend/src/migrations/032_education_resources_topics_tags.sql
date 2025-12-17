-- Migration 032: Add topics and tags support for education_resources
-- Create junction tables similar to posts

-- Education Resource Topics junction table
CREATE TABLE IF NOT EXISTS education_resource_topics (
    education_resource_id UUID REFERENCES education_resources(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (education_resource_id, topic_id)
);

-- Education Resource Tags junction table
CREATE TABLE IF NOT EXISTS education_resource_tags (
    education_resource_id UUID REFERENCES education_resources(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (education_resource_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_education_resource_topics_resource ON education_resource_topics(education_resource_id);
CREATE INDEX IF NOT EXISTS idx_education_resource_topics_topic ON education_resource_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_education_resource_tags_resource ON education_resource_tags(education_resource_id);
CREATE INDEX IF NOT EXISTS idx_education_resource_tags_tag ON education_resource_tags(tag_id);

COMMENT ON TABLE education_resource_topics IS 'Junction table linking education resources to topics';
COMMENT ON TABLE education_resource_tags IS 'Junction table linking education resources to tags';
