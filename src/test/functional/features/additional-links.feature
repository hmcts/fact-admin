
@fact-admin-tab-additional-links
Feature: Additional-links

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to court with "aberystwyth-justice-centre"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over Additional Links nav element
    Then I click the Additional Links tab
    When I remove all existing Additional Links entries and save
    Then a green update message is displayed in the Additional Links tab "Additional links updated"
    And there are no  Additional Link entries

  Scenario: Add and remove Additional Links
    When I enter a new Additional Links entry by adding URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And I click the Add new additional link button in the Additional Links tab
    And I enter a new Additional Links entry by adding URL "https://www.google.co.uk/" display name "englishName2" and welsh display name "welshName2"
    And I click save Additional Links
    Then a green update message is displayed in the Additional Links tab "Additional links updated"
    Then the second last Additional link is displayed with URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And the last Additional link is displayed with URL "https://www.google.co.uk/" display name "englishName2" and welsh display name "welshName2"

  Scenario: Reorder Additional Links
    When I enter a new Additional Links entry by adding URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And I click the Add new additional link button in the Additional Links tab
    And I enter a new Additional Links entry by adding URL "https://www.google.co.uk/" display name "englishName2" and welsh display name "welshName2"
    And I click save Additional Links
    Then the second last Additional link is displayed with URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And the last Additional link is displayed with URL "https://www.google.co.uk/" display name "englishName2" and welsh display name "welshName2"
    When I click the move up button on the last additional links entry
    And I click save Additional Links
    Then a green update message is displayed in the Additional Links tab "Additional links updated"
    And the second last Additional link is displayed with URL "https://www.google.co.uk/" display name "englishName2" and welsh display name "welshName2"
    And the last Additional link is displayed with URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    When I click the move down button on the second last additional links entry
    And I click save Additional Links
    Then a green update message is displayed in the Additional Links tab "Additional links updated"
    And the second last Additional link is displayed with URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And the last Additional link is displayed with URL "https://www.google.co.uk/" display name "englishName2" and welsh display name "welshName2"

  Scenario: Prevent blank entries being added
    When When I enter a new Additional Links entry by adding URL "https://www.gov.uk/find-court-tribunal" and leave display name field blank
    And I click save Additional Links
    Then An error is displayed for additional links with summary "URL and display name are required for all additional links." and display name field message "Display name is required"
    When I clear additional link fields
    And When I enter a new Additional Links entry by adding english display name "English" and leave URL field blank
    And I click save Additional Links
    Then An error is displayed for additional links with summary "URL and display name are required for all additional links." and URL field message "URL is required"

  Scenario: URL format check
    When I enter a new Additional Links entry by adding URL "find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And I click save Additional Links
    Then An error is displayed for additional links with summary "All URLs must be in valid format" and URL field message "Invalid URL format"

  Scenario: Prevent duplicated entries being added
    When I enter a new Additional Links entry by adding URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And I click the Add new additional link button in the Additional Links tab
    And I enter a new Additional Links entry by adding URL "https://www.gov.uk/find-court-tribunal" display name "englishName2" and welsh display name "welshName2"
    And I click save Additional Links
    Then An error is displayed for additional links with summary "All URLs must be unique." and URL field messages "Duplicated URL"
    When I reload the page
    When I enter a new Additional Links entry by adding URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And I click the Add new additional link button in the Additional Links tab
    And I enter a new Additional Links entry by adding URL "https://www.google.co.uk/" display name "englishName1" and welsh display name "welshName2"
    And I click save Additional Links
    Then An error is displayed for additional links with summary "All display names must be unique." and display name field messages "Duplicated display name"


