Feature: Add new court

  Background:
    Given I am on new browser
    Given I am on FACT homepage
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
    Then The error message displays for invalid name "Invalid court name: please amend and try again. Valid characters are: A-Z, a-z, 0-9, apostrophes, brackets and hyphens"

  Scenario: Adding a new service centre without adding service areas
    Given I entered the new court name as "test service centre" in the name text box
    Then I entered the longitude "0"
    Then I entered the latitude "0"
    Then I select yes for the court be service centre
    And I click on add new court button
    Then The error message displays for not adding service area "One or more mandatory fields are empty or have invalid values, please check allow and try again. If you are adding a service centre, make sure to ensure at least one service area is selected."
