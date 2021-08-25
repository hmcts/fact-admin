Feature: Additional-links

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    Then I can view the courts or tribunals in a list format
    When I click edit next to court with "aberystwyth-justice-centre"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over Additional Links nav element
    Then I click the Additional Links tab
    Then I can view the existing Additional Links

  Scenario: Add and remove Additional Links
    When I remove all existing Additional Links entries and save
    Then a green update message is displayed in the Additional Links tab "Additional links updated"
    When I enter a new Additional Links entry by adding URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And I click the Add new additional link button in the Additional Links tab
    And I enter a new Additional Links entry by adding URL "https://www.google.co.uk/" display name "englishName2" and welsh display name "welshName2"
    And I click save Additional Links
    Then a green update message is displayed in the Additional Links tab "Additional links updated"
    Then the second last Additional link is displayed with URL "https://www.gov.uk/find-court-tribunal" display name "englishName1" and welsh display name "welshName1"
    And the last Additional link is displayed with URL "https://www.google.co.uk/" display name "englishName2" and welsh display name "welshName2"
    When I click the remove button under an Additional link entry
    And I click the remove button under an Additional link entry
    And I click save Additional Links
    Then a green update message is displayed in the Additional Links tab "Additional links updated"
    And there are no  Additional Link entries

