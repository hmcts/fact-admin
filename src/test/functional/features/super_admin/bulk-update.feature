Feature: Bulk update of court info

  Background: Log in
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I go to the courts page

  Scenario: Edit information for closed courts
    When I click bulk update
    Then I am on the "Bulk edit of additional information" page
    Then I check include closed checkbox
    When I add an "Additional Information" in the rich editor field provided "#info_message"
    And I select court "aberdare-county-court"
    And I select court "aberdare-magistrates-court"
    And I click the update button
    Then a message is displayed on the page

  Scenario: Edit information for open courts
    When I click bulk update
    Then I am on the "Bulk edit of additional information" page
    When I add an "Additional Information" in the rich editor field provided "#info_message"
    And I select court "aberdeen-tribunal-hearing-centre"
    And I select court "aberystwyth-justice-centre"
    And I click the update button
    Then a message is displayed on the page
