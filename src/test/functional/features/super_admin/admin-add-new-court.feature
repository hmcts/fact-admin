Feature: Add new court

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click on add new court link
    Then I am redirected to the add new court "Add new court" page

  Scenario: Adding a court with the name already exist
    Given I entered the new court name as "Administrative Court" in the name text box
    Then I entered the longitude "0"
    Then I entered the latitude "0"
    Then I select no for the court be service centre
    And I click on add new court button
    Then The error message displays for a existing court name "A court already exists for court provided: Administrative Court"

  Scenario: Adding a new court with invalid name
    Given I entered the new court name as "Test123#" in the name text box
    Then I entered the longitude "0"
    Then I entered the latitude "0"
    And I click on add new court button
    Then The error message displays for invalid name "Invalid court name: Valid characters are: A-Z, a-z, 0-9, apostrophes, brackets and hyphens"

  Scenario: Adding a new service centre without adding service areas
    Given I entered the new court name as "test service centre" in the name text box
    Then I entered the longitude "0"
    Then I entered the latitude "0"
    Then I select yes for the court be service centre
    And I click on add new court button
    Then The error message displays for not adding service area "At least one service area must be selected"
#
  Scenario: Adding a new court with invalid longitude
    Given I entered the new court name as "Test123" in the name text box
    Then I entered the longitude "xyz"
    Then I entered the latitude "12"
    And I click on add new court button
    Then the error message displays for longitude: "The longitude value needs to be a number"

  Scenario: Adding a new court with invalid latitude
    Given I entered the new court name as "Test123" in the name text box
    Then I entered the longitude "12"
    Then I entered the latitude "!!"
    And I click on add new court button
    Then the error message displays for latitude: "The latitude value needs to be a number"

  Scenario: Adding a new court with empty longitude
    Given I entered the new court name as "Test123" in the name text box
    Then I entered the longitude " "
    Then I entered the latitude "12"
    And I click on add new court button
    Then the error message displays for longitude: "A longitude value is required"

  Scenario: Adding a new court with empty latitude
    Given I entered the new court name as "Test123" in the name text box
    Then I entered the longitude "12"
    Then I entered the latitude ""
    And I click on add new court button
    Then the error message displays for latitude: "A latitude value is required"
