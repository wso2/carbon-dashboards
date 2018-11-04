package org.wso2.carbon.siddhi.apps.api.rest.bean;


public class SiddhiDefinition implements Comparable<SiddhiDefinition> {
    private String definitionName;
    private String definitionText;
    private String type;
    private String attributes;

    public SiddhiDefinition(String definitionName, String definitionText,String type) {
        this.definitionName = definitionName;
        this.definitionText = definitionText;
        this.type = type;
    }

    public SiddhiDefinition(String definitionName, String definitionText, String type, String attributes) {
        this.definitionName = definitionName;
        this.definitionText = definitionText;
        this.type = type;
        this.attributes=attributes;
    }

    public String getDefinitionName() {
        return definitionName;
    }

    public void setDefinitionName(String definitionName) {
        this.definitionName = definitionName;
    }

    public String getDefinitionText() {
        return definitionText;
    }

    public void setDefinitionText(String definitionText) {
        this.definitionText = definitionText;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public String getAttributes() {
        return attributes;
    }

    public void setAttributes(String attributes) {
        this.attributes = attributes;
    }

    @Override
    public int compareTo(SiddhiDefinition sd) {
        return this.getDefinitionName().compareTo(sd.definitionName);
    }
}
