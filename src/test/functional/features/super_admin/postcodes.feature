@fact-admin-tab-postcodes @fact-admin-tab-types

Feature: Postcodes

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to court with "county-court-money-claims-centre-ccmcc"
    Then I am redirected to the Edit Court page for the chosen court
    And I hover over types nav element
    When I click the types tab
    And I will make sure County court type is selected
    When I click the postcodes tab

  Scenario: Adding and deleting valid postcodes
    When I will make sure to delete the existing postcodes
    When I add new postcodes "bd7 2qb,bd3,BD7"
    Then I click the add postcode button
    Then A green message is displayed for the postcodes "Postcodes updated"
    When I will make sure to delete the existing postcodes
    Then A green message is displayed for the postcodes "Postcodes updated"

  Scenario: Adding invalid and duplicate postcode
    When I will make sure to delete the existing postcodes
    When I add new postcodes "bdx,123,bd1"
    Then I click the add postcode button
    Then The error message display for the postcodes "A problem has occurred (your changes have not been saved). The following postcodes are invalid: bdx,123"
    When I add new postcodes "bd1"
    Then I click the add postcode button
    When I add new postcodes "bd1"
    Then I click the add postcode button
    Then The error message display for the postcodes "One or more postcodes provided already exist (your changes have not been saved): BD1"

  Scenario Outline: Moving postcodes from the source court to the destination court
    When I will make sure to delete the existing postcodes
    When I add new postcodes "bd10,bd2,bd4"
    Then I click the add postcode button
    Then A green message is displayed for the postcodes "Postcodes updated"
    Then I will make sure to delete the existing postcodes for the court "<view_court_slug>"
    Then I go back to the editing postcodes for source court "county-court-money-claims-centre-ccmcc"
    When I choose the postcodes "BD4" and "BD2" to move them from the source court to the destination court
    Then I choose the destination court as "<view_court_slug>"
    Then I click the move button
    Then A green message is displayed for the postcodes "Postcodes updated"

    Examples:
      | view_court_slug             |
      | county-court-business-centre-ccbc |
